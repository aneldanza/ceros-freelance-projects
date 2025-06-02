import { fields } from "./constants";
import { NodeTree } from "./NodeTree";
import { Observable } from "./Observer";
import { Node } from "./Node";

export class QuizContext {
  private currentNode: Observable<Node>;

  constructor(
    public CerosSDK: CerosSDK,
    public experience: Experience,
    private nodeTree: NodeTree
  ) {
    this.init();
    this.currentNode = new Observable<Node>(this.nodeTree.root);
  }

  init() {}
}
