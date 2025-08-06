/// <reference path="../../types/papaparse.d.ts" />

import {
  PATH,
  OPTION,
  QUESTION,
  BACK,
  fieldNodesDict,
  NAV,
  RESET,
  MCASE_ADAPTER,
  RELATED_PRODUCTS,
  IMG_LRG,
  path2Fields,
} from "./constants";
import { NodeTree } from "./NodeTree";
import { Observable } from "./Observer";
import { Node } from "./Node";
import { getValueFromTags, capitalize, stepsFromFieldNames } from "./utils";
import { HidingOptionsStrategy } from "./questionStrategies/HidingOptionsStrategy";
import { QuestionStrategy } from "./questionStrategies/QuestionStrategy";
import { ResultHandler } from "./ResultHandler";
import { DoubleClickBugHandler } from "./DoubleClickBugHandler";
import { ModuleHandler } from "./ModuleHandler";
import { QuestionStrategyFactory } from "./questionStrategies/QuestionStrategyFactory";
import { MaskingOptionsStrategyWithMultipleCellValues } from "./questionStrategies/MaskOptionsStrateyWithMultipleCellValues";

export class QuizContext {
  private currentNode: Observable<Node>;
  private answerCollection: CerosComponentCollection;
  private backLayersCollection: CerosLayerCollection;
  private navCollecttion: CerosComponentCollection;
  private pathTextCollection: CerosComponentCollection;
  private questions: Record<string, QuestionStrategy> = {};
  private resetCollection: CerosLayerCollection;
  private resultHandler: ResultHandler;
  private doubleClickHandler: DoubleClickBugHandler;
  private mcaseAdapterModuleHandler: ModuleHandler;
  private mcaseAdapterCtaCollection: CerosLayerCollection;
  private imgLargeOverlayCollection = this.experience.findLayersByTag(IMG_LRG);

  private imgLrgLink: Observable<string> = new Observable("");
  private imgLrgCloseHotspotCollection = this.experience.findLayersByTag(
    `${IMG_LRG}-close`
  );
  private currentTree: NodeTree;

  constructor(
    public CerosSDK: CerosSDK,
    public experience: Experience,
    nodeTree: NodeTree,
    public distributor: string,
    private relatedProductsLink: string,
    private accessoriesLink: string,
    private PapaParse: typeof window.Papa,
    private path2Link: string
  ) {
    this.currentTree = nodeTree;
    this.currentNode = new Observable<Node>(nodeTree.root);
    this.answerCollection = this.experience.findComponentsByTag(OPTION);
    this.backLayersCollection = this.experience.findLayersByTag(BACK);
    this.navCollecttion = this.experience.findComponentsByTag(NAV);
    this.pathTextCollection = this.experience.findComponentsByTag(PATH);
    this.resetCollection = this.experience.findLayersByTag(RESET);
    this.mcaseAdapterCtaCollection = this.experience.findLayersByTag(
      `${MCASE_ADAPTER}-cta`
    );
    this.resultHandler = new ResultHandler(
      experience,
      CerosSDK,
      this.currentNode,
      distributor,
      relatedProductsLink,
      accessoriesLink,
      PapaParse,
      this.imgLrgLink
    );

    this.mcaseAdapterModuleHandler = new ModuleHandler(
      MCASE_ADAPTER,
      experience,
      CerosSDK,
      distributor,
      this.resultHandler.landingPageProxy,
      this.imgLrgLink
    );

    this.doubleClickHandler = new DoubleClickBugHandler();

    this.init();
  }

  init() {
    this.subscribeCurrentNodeObserver();
    this.subscribeToCerosEvents();
    this.assignQuestionsStrategy();
    this.registerImageOverlay();
  }

  registerImageOverlay() {
    this.imgLargeOverlayCollection.on(
      this.CerosSDK.EVENTS.ANIMATION_STARTED,
      (layer: CerosLayer) => {
        ModuleHandler.handleModuleImage(layer, {
          image: this.imgLrgLink.value,
        });
      }
    );

    this.imgLrgCloseHotspotCollection.on(this.CerosSDK.EVENTS.CLICKED, () => {
      this.imgLrgLink.value = "";
    });

    this.imgLrgLink.subscribe((link: string) => {
      this.imgLargeOverlayCollection.layers.forEach((layer) => {
        ModuleHandler.handleModuleImage(layer, { image: link });
      });
    });
  }

  subscribeCurrentNodeObserver() {
    this.currentNode.subscribe(this.handleNodeChange.bind(this));
    this.currentNode.subscribe(this.updatePath.bind(this));
  }

  assignQuestionsStrategy() {
    for (const fieldName in fieldNodesDict) {
      const field = fieldNodesDict[fieldName];

      if (field.type === "question") {
<<<<<<< HEAD
        const strategy = QuestionStrategyFactory.create(
          fieldName,
          field,
          this.experience,
          this.currentNode,
          this.CerosSDK
        );

=======
        if (field.questionStrategy === "hiding") {
          strategy = new HidingOptionsStrategy(
            fieldName,
            this.experience,
            this.currentNode,
            this.CerosSDK
          );
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
>>>>>>> develop
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

    this.resetCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.resetQuiz.bind(this)
    );

    this.mcaseAdapterCtaCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleMcaseAdapter.bind(this)
    );
  }

  async handleMcaseAdapter(layer: CerosLayer) {
    if (this.doubleClickHandler.isDoubleClickBug(layer.id)) return;

    const partNum = layer.getPayload().trim();

    await this.resultHandler.loadCsvData(
      RELATED_PRODUCTS,
      this.relatedProductsLink
    );

    const data = this.resultHandler.csvData[RELATED_PRODUCTS][partNum];

    if (data) {
      this.mcaseAdapterModuleHandler.updateModule(1, 0, data);

      const hotspotCollection = this.experience.findComponentsByTag(
        `${MCASE_ADAPTER}-1`
      );

      hotspotCollection.click();
    } else {
      console.error(`Could not find part ${partNum} in related products sheet`);
    }
  }

  resetQuiz() {
    this.currentNode.value = this.currentTree.root;
  }

  async handleAnswerClick(comp: CerosComponent) {
    if (this.doubleClickHandler.isDoubleClickBug(comp.id)) return;

    const qName = getValueFromTags(comp.getTags(), QUESTION);
    const question = this.questions[qName];
    const answer = comp.getPayload().trim();

    if (!question) {
      console.error(`Could not find question field ${qName}`);
      return;
    }

    const nextNode = await this.getNextNode(qName, answer, question, comp);

    if (nextNode) {
      this.updateCurrentNodeValue(nextNode, qName, answer);
    } else {
      console.error(
        `coudn't find node with ${qName} and value ${answer} id: ${comp.id}`
      );
    }
  }

  updateCurrentNodeValue(nextNode: Node, qName: string, answer: string) {
    if (
      fieldNodesDict[qName].skipif &&
      fieldNodesDict[qName].skipif.find((str) => str === answer) &&
      nextNode.children.length
    ) {
      this.currentNode.value = nextNode.children[0];
    } else {
      this.currentNode.value = nextNode;
    }
  }

  async getNextNode(
    qName: string,
    answer: string,
    question: QuestionStrategy,
    comp: CerosComponent
  ) {
    if (qName === "fuse type" && answer.toLowerCase() === "guide me") {
      //load path2 csv data

      this.currentTree = await this.loadCsvDataIntoNodeTree();
      this.currentNode.value = this.currentTree.root;

      return this.currentTree.findChild(
        this.currentNode.value,
        "value",
        answer
      );
    } else {
      const { key, value }: { key: "elementId" | "value"; value: string } =
        question instanceof HidingOptionsStrategy
          ? { key: "elementId", value: comp.id }
          : { key: "value", value: answer };

      return this.currentTree.findChild(this.currentNode.value, key, value);
    }
  }

  loadCsvDataIntoNodeTree() {
    return new Promise<NodeTree>((resolve, reject) => {
      const path2FieldNodesDict = stepsFromFieldNames(
        path2Fields,
        fieldNodesDict
      );
      const tree = new NodeTree(path2FieldNodesDict);

      this.PapaParse.parse(this.path2Link, {
        header: true,
        download: true,
        complete: (result) => {
          tree.buildTree(result.data, path2Fields);
          resolve(tree);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  }

  handleBackNavigation(layer: CerosLayer) {
    // Prevent double-click bug
    if (this.doubleClickHandler.isDoubleClickBug(layer.id)) return;

    const current = this.currentNode.value;
    const parent = current.parent;
    if (!parent) return;

    const name = current.name;
    console.log(`clicked back to ${current.name}`);
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
