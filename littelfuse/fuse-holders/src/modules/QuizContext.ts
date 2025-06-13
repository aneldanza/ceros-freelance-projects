import {
  PATH,
  OPTION,
  QUESTION,
  maskingStrategyQuestions,
  hidingStrategyQuestions,
  pathMap,
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
    hidingStrategyQuestions.forEach((fieldName) => {
      const name = fieldName.toLowerCase();
      const strategy = new HidingOptionsStrategy(name, this.experience);
      this.questions[name] = strategy;
    });

    maskingStrategyQuestions.forEach((fieldName) => {
      const name = fieldName.toLowerCase();
      const strategy = new MaskingOptionsStrategy(
        name,
        this.experience,
        this.currentNode,
        this.CerosSDK
      );
      this.questions[name] = strategy;
    });
  }

  subscribeToCerosEvents() {
    this.answerCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleAnswerClick.bind(this)
    );
  }

  handleAnswerClick(comp: CerosComponent) {
    if (!this.doubleClickHandler.isDoubleClickBug(comp.id)) {
      const qName = getValueFromTags(comp.getTags(), QUESTION);
      const question = this.questions[qName];

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

  handleNodeChange(node: Node) {
    if (node.children) {
      if (this.isLastQuestion(node)) {
        console.log("show results!");
        this.resultHandler.showResultModule(node.children.length);
      } else {
        console.log("display next question answer options");
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
      const formattedValue = capitalize(value.split(" ").join(""));
      const text = template.replace("{{}}", formattedValue);
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
