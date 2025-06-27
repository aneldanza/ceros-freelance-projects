/// <reference path="../../types/papaparse.d.ts" />

import { PATH, OPTION, QUESTION, BACK, fieldNodesDict, NAV } from "./constants";
import { NodeTree } from "./NodeTree";
import { Observable } from "./Observer";
import { Node } from "./Node";
import { getValueFromTags, capitalize } from "./utils";
import { HidingOptionsStrategy } from "./questionStrategies/HidingOptionsStrategy";
import { QuestionStrategy } from "./questionStrategies/QuestionStrategy";
import { MaskingOptionsStrategy } from "./questionStrategies/MaskingOptionsStrategy";
import { ResultHandler } from "./ResultHandler";
import { DoubleClickBugHandler } from "./DoubleClickBugHandler";
import { MaskingOptionsWithSubcategoriesStrategy } from "./questionStrategies/MaskingOptionsWithSubCategoriesStrategy";

export class QuizContext {
  private currentNode: Observable<Node>;
  private answerCollection: CerosComponentCollection;
  private backLayersCollection: CerosLayerCollection;
  private navCollecttion: CerosComponentCollection;
  private pathTextCollection: CerosComponentCollection;
  private questions: Record<string, QuestionStrategy> = {};
  private resultHandler: ResultHandler;
  private doubleClickHandler: DoubleClickBugHandler;

  constructor(
    public CerosSDK: CerosSDK,
    public experience: Experience,
    private nodeTree: NodeTree,
    public distributor: string,
    private relatedProductsLink: string,
    private accessoriesLink: string,
    private PapaParse: typeof window.Papa
  ) {
    this.currentNode = new Observable<Node>(this.nodeTree.root);
    this.answerCollection = this.experience.findComponentsByTag(OPTION);
    this.backLayersCollection = this.experience.findLayersByTag(BACK);
    this.navCollecttion = this.experience.findComponentsByTag(NAV);
    this.pathTextCollection = this.experience.findComponentsByTag(PATH);
    this.resultHandler = new ResultHandler(
      experience,
      CerosSDK,
      this.currentNode,
      distributor,
      relatedProductsLink,
      accessoriesLink,
      PapaParse
    );

    this.doubleClickHandler = new DoubleClickBugHandler();

    this.init();
  }

  init() {
    this.subscribeCurrentNodeObserver();
    this.subscribeToCerosEvents();
    this.assignQuestionsStrategy();
  }

  subscribeCurrentNodeObserver() {
    this.currentNode.subscribe(this.handleNodeChange.bind(this));
    this.currentNode.subscribe(this.updatePath.bind(this));
  }

  assignQuestionsStrategy() {
    for (const fieldName in fieldNodesDict) {
      const field = fieldNodesDict[fieldName];
      let strategy: QuestionStrategy;

      if (field.type === "question") {
        if (field.questionStrategy === "hiding") {
          strategy = new HidingOptionsStrategy(fieldName, this.experience);
        } else if (field.questionStrategy === "masking-with-subcategories") {
          strategy = new MaskingOptionsWithSubcategoriesStrategy(
            fieldName,
            this.experience,
            this.currentNode,
            this.CerosSDK
          );
        } else {
          strategy = new MaskingOptionsStrategy(
            fieldName,
            this.experience,
            this.currentNode,
            this.CerosSDK
          );
        }
        this.questions[fieldName] = strategy;
      }
    }
  }

  subscribeToCerosEvents() {
    this.answerCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleAnswerClick.bind(this)
    );

    this.backLayersCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleBackNavigation.bind(this)
    );

    this.navCollecttion.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleRandomNavigation.bind(this)
    );
  }

  handleAnswerClick(comp: CerosComponent) {
    if (this.doubleClickHandler.isDoubleClickBug(comp.id)) return;

    const qName = getValueFromTags(comp.getTags(), QUESTION);
    const question = this.questions[qName];
    const answer = comp.getPayload().trim();

    if (!question) {
      console.error(`Could not find question field ${qName}`);
      return;
    }

    const { key, value }: { key: "elementId" | "value"; value: string } =
      question instanceof HidingOptionsStrategy
        ? { key: "elementId", value: comp.id }
        : { key: "value", value: answer };

    const node = this.nodeTree.findChild(this.currentNode.value, key, value);

    if (node) {
      if (
        fieldNodesDict[qName].skipif &&
        fieldNodesDict[qName].skipif.find((str) => str === answer)
      ) {
        const nextNode = node.children[0];
        this.currentNode.value = nextNode;
      } else {
        this.currentNode.value = node;
      }
    } else {
      console.error(`coudn't find node with ${qName} and value ${value}`);
    }
  }

  handleBackNavigation(layer: CerosLayer) {
    // Prevent double-click bug
    if (this.doubleClickHandler.isDoubleClickBug(layer.id)) return;

    const current = this.currentNode.value;
    const parent = current.parent;
    if (!parent) return;

    const name = current.name;
    const field = fieldNodesDict[name];

    // Check if skipBackIf logic applies
    if (field && field.skipBackIf) {
      const skipData = field.skipBackIf;
      const nodeName = Object.keys(skipData)[0];
      const valueArray = skipData[nodeName];

      const ancestor = current.findParentByName(nodeName);
      if (ancestor && valueArray.find((val) => val === ancestor.value)) {
        // Skip one extra level if condition matches
        this.currentNode.value = parent.parent || parent;
        return;
      }
    }

    // Default: go back one level
    this.currentNode.value = parent;
  }

  handleRandomNavigation(comp: CerosComponent) {
    const name = comp.getPayload().toLowerCase();
    const node = this.currentNode.value.findParentByName(name);
    if (node && node.parent) {
      this.currentNode.value = node.parent;
    } else {
      console.error(`Could not find node ${name} or it's parent`);
    }
  }

  handleNodeChange(node: Node) {
    if (node.children) {
      if (this.isLastQuestion(node)) {
        this.resultHandler.showResultModule(node.children.length);
      } else {
        console.log(this.currentNode.value);
        const childNodeName = node.children[0].name.toLowerCase();
        this.questions[childNodeName] &&
          this.questions[childNodeName].displayAnswerOptions(node);
      }
    }
  }

  updatePath(node: Node) {
    let currentNode = node;
    const pathArray: string[] = [];
    const nodePath = currentNode.getPath();

    nodePath.forEach(({ name, value }) => {
      if (name === "Root") {
        return;
      }
      const template = fieldNodesDict[name].pathText;
      const text = template.replace("{{}}", capitalize(value));
      pathArray.push(text);
    });

    pathArray.length
      ? this.pathTextCollection.setText(pathArray.join("  >  "))
      : this.pathTextCollection.setText("");

    this.pathTextCollection.show();
  }

  isLastQuestion(node: Node) {
    const childNode = node.children[0];
    return Object.keys(childNode.data).length;
  }
}
