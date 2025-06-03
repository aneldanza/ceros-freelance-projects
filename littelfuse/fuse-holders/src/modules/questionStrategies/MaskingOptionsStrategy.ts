import { Node } from "../Node";
import { Observable } from "../Observer";
import { QuestionStrategy } from "./QuestionStrategy";

export class MaskingOptionsStrategy extends QuestionStrategy {
  private maskCollection: CerosLayerCollection;
  constructor(
    name: string,
    experience: Experience,
    private currentNodeObservable: Observable<Node>,
    private CerosSDK: CerosSDK
  ) {
    super(name, experience);
    this.maskCollection = this.experience.findLayersByTag(`mask:${this.name}`);
  }

  displayAnswerOptions(node: Node): void {
    this.maskCollection.components.forEach((comp: CerosComponent) => {
      this.handleMasks(comp, node);
    });
  }

  handleMasks(mask: CerosComponent, node: Node) {
    const foundNode = node.findChildByValueProperty(mask.getPayload().trim());

    if (foundNode) {
      mask.hide();
    } else {
      mask.show();
    }
  }

  registerMaskAnimations() {
    this.maskCollection.on(
      this.CerosSDK.EVENTS.ANIMATION_STARTED,
      (mask: CerosComponent) => {
        this.handleMasks(mask, this.currentNodeObservable.value);
      }
    );
  }
}
