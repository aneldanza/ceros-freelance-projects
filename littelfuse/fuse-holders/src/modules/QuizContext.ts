import {
  fields,
  OPTION,
  QUESTION,
  maskingStrategyQuestions,
  hidingStrategyQuestions,
} from "./constants";
import { NodeTree } from "./NodeTree";
import { Observable } from "./Observer";
import { Node } from "./Node";
import {
  getValueFromTags,
  calculateMaxNumberOfEvenAndOddChildrenAtPosition,
} from "./utils";
import { HidingOptionsStrategy } from "./questionStrategies/HidingOptionsStrategy";
import { QuestionStrategy } from "./questionStrategies/QuestionStrategy";

export class QuizContext {
  private currentNode: Observable<Node>;
  private answerCollection: CerosComponentCollection;
  private questions: Record<string, QuestionStrategy> = {};

  constructor(
    public CerosSDK: CerosSDK,
    public experience: Experience,
    private nodeTree: NodeTree
  ) {
    this.currentNode = new Observable<Node>(this.nodeTree.root);
    this.answerCollection = this.experience.findComponentsByTag(OPTION);

    this.init();

    setTimeout(() => {
      const result = calculateMaxNumberOfEvenAndOddChildrenAtPosition(
        "Fuse Holder Voltage",
        this.nodeTree
      );
      console.log(result); // { maxEven: X, maxOdd: Y }
    }, 500);
  }

  init() {
    this.subscribeCurrentNodeObserver();
    this.subscribeToCerosEvents();
    this.assignQuestionsStrategy();
  }

  subscribeCurrentNodeObserver() {
    this.currentNode.subscribe(this.handleNodeChange.bind(this));
  }

  assignQuestionsStrategy() {
    hidingStrategyQuestions.forEach((fieldName) => {
      const name = fieldName.toLowerCase();
      const strategy = new HidingOptionsStrategy(name, this.experience);
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

  handleNodeChange(node: Node) {
    if (node.children) {
      if (this.isLastQuestion(node)) {
        console.log("show results!");
      } else {
        console.log("display next question answer options");
        console.log(this.currentNode);
        const childNodeName = node.children[0].name.toLowerCase();
        this.questions[childNodeName] &&
          this.questions[childNodeName].displayAnswerOptions(node);
      }
    }
  }

  isLastQuestion(node: Node) {
    const childNode = node.children[0];
    return Object.keys(childNode.data).length;
  }
}
