import { Node } from "../Node";
import { Observable } from "../Observer";
import { QuestionStrategy } from "./QuestionStrategy";

export class MaskingOptionsStrategy extends QuestionStrategy {
  protected maskCollection: CerosLayerCollection;
  constructor(
    name: string,
    experience: Experience,
    private currentNodeObservable: Observable<Node>,
    private CerosSDK: CerosSDK
  ) {
    super(name, experience);
    this.maskCollection = this.experience.findLayersByTag(`mask:${this.name}`);
  }

  reset(): void {}

  displayAnswerOptions(node: Node): void {
    this.maskCollection.layers.forEach((comp: CerosLayer) => {
      this.handleMasks(comp, node);
    });
  }

  handleMasks(mask: CerosLayer, node: Node) {
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
      (mask: CerosLayer) => {
        this.handleMasks(mask, this.currentNodeObservable.value);
      }
    );
  }
}
