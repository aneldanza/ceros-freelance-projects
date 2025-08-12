import { Node } from "../Node";
import { Observable } from "../Observer";
import { QuestionStrategy } from "./QuestionStrategy";

export class MaskingOptionsStrategy extends QuestionStrategy {
  protected maskCollection: CerosLayerCollection;

  constructor(
    name: string,
    experience: Experience,
    CerosSDK: CerosSDK,
    private currentNodeObservable: Observable<Node>
  ) {
    super(name, experience, CerosSDK);
    this.key = "value";
    this.maskCollection = this.experience.findLayersByTag(`mask:${this.name}`);
    this.registerCerosEvents();
  }

  registerCerosEvents() {
    this.optionsCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleOptionClick.bind(this)
    );
  }

  handleOptionClick(comp: CerosComponent): void {
    const answer = comp.getPayload().trim() || "";
    const array = this.selectedOption.value.split(":");
    array[1] = this.key;
    array[2] = answer;
    this.selectedOption.value = array.join(":");
  }

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
