import {
  PATH,
  OPTION,
  QUESTION,
  maskingStrategyQuestions,
  hidingStrategyQuestions,
  pathMap,
  BACK,
  fieldNodesDict,
} from "./constants";
import { NodeTree } from "./NodeTree";
import { Observable } from "./Observer";
import { Node } from "./Node";
import { getValueFromTags, capitalize } from "./utils";
import { HidingOptionsStrategy } from "./questionStrategies/HidingOptionsStrategy";
import { QuestionStrategy } from "./questionStrategies/QuestionStrategy";
import { MaskingOptionsStrategy } from "./questionStrategies/MaskingOptionsStrategy";
import { ResultHandler } from "./ResultHandler";
import { DoubleClickBugHandler } from "./DoubleClickBugHandler";

export class QuizContext {
  private currentNode: Observable<Node>;
  private answerCollection: CerosComponentCollection;
  private backLayersCollection: CerosLayerCollection;
  private pathTextCollection: CerosComponentCollection;
  private questions: Record<string, QuestionStrategy> = {};
  private resultHandler: ResultHandler;
  private doubleClickHandler: DoubleClickBugHandler;

  constructor(
    public CerosSDK: CerosSDK,
    public experience: Experience,
    private nodeTree: NodeTree,
    distributor: string
  ) {
    this.currentNode = new Observable<Node>(this.nodeTree.root);
    this.answerCollection = this.experience.findComponentsByTag(OPTION);
    this.backLayersCollection = this.experience.findLayersByTag(BACK);
    this.pathTextCollection = this.experience.findComponentsByTag(PATH);
    this.resultHandler = new ResultHandler(
      experience,
      CerosSDK,
      this.currentNode,
      distributor
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
      if (field.questionStrategy && field.type === "question") {
        if (field.questionStrategy === "hiding") {
          const strategy = new HidingOptionsStrategy(
            fieldName,
            this.experience
          );
          this.questions[fieldName] = strategy;
        } else if (field.questionStrategy === "masking") {
          const strategy = new MaskingOptionsStrategy(
            fieldName,
            this.experience,
            this.currentNode,
            this.CerosSDK
          );
          this.questions[fieldName] = strategy;
        }
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
  }

  handleAnswerClick(comp: CerosComponent) {
    if (!this.doubleClickHandler.isDoubleClickBug(comp.id)) {
      const qName = getValueFromTags(comp.getTags(), QUESTION);
      const question = this.questions[qName];

      if (!question) {
        console.error(`Could not find question field ${qName}`);
        return;
      }

      const { key, value }: { key: "elementId" | "value"; value: string } =
        question instanceof HidingOptionsStrategy
          ? { key: "elementId", value: comp.id }
          : { key: "value", value: comp.getPayload() };

      const node = this.nodeTree.findChild(this.currentNode.value, key, value);

      if (node) {
        this.currentNode.value = node;
      } else {
        console.error(`coudn't find node with ${qName} and value ${value}`);
      }
    }
  }

  handleBackNavigation(layer: CerosLayer) {
    if (!this.doubleClickHandler.isDoubleClickBug(layer.id)) {
      if (this.currentNode.value.parent) {
        this.currentNode.value = this.currentNode.value.parent;
      }
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
      const template = pathMap[name];
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
