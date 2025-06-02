import { fields, OPTION, QUESTION } from "./constants";
import { NodeTree } from "./NodeTree";
import { Observable } from "./Observer";
import { Node } from "./Node";
import { getValueFromTags } from "./utils";

export class QuizContext {
  private currentNode: Observable<Node>;
  private answerCollection: CerosComponentCollection;

  constructor(
    public CerosSDK: CerosSDK,
    public experience: Experience,
    private nodeTree: NodeTree
  ) {
    this.currentNode = new Observable<Node>(this.nodeTree.root);
    this.answerCollection = this.experience.findComponentsByTag(OPTION);

    this.init();
  }

  init() {
    this.answerCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleAnswerClick.bind(this)
    );
  }

  handleAnswerClick(comp: CerosComponent) {
    const qName = getValueFromTags(comp.getTags(), QUESTION);
    const value = comp.getPayload();
    const node = this.nodeTree.findChild(this.currentNode.value, qName, value);

    if (node) {
      this.currentNode.value = node;
      console.log(this.currentNode);
    } else {
      console.error(`coudn't find node with ${qName} and value ${value}`);
    }
  }
}
