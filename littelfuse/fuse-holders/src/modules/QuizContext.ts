import { fields } from "./constants";
import { NodeTree } from "./NodeTree";

export class QuizContext {
  constructor(
    public CerosSDK: CerosSDK,
    public experience: Experience,
    private nodeTree: NodeTree
  ) {
    this.init();
  }

  init() {}
}
