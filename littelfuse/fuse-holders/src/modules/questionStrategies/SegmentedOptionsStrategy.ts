import { FUSE_TYPE_INFO, PARTS, PATH2 } from "../constants";
import { PartModuleHandler } from "../moduleStrategies/PartModuleHander";
import { Node } from "../Node";
import { Observable } from "../Observer";
import { QuestionStrategy } from "./QuestionStrategy";

export class SegmentedOptionsStrategy extends QuestionStrategy {
  private partModuleHandler: PartModuleHandler;
  private fuseTypeInfoCollection: CerosComponentCollection;
  private currentSegment: Observable<string>;
  private segments: { [key: string]: Node[] } = {};

  constructor(
    name: string,
    experience: Experience,
    private CerosSDK: CerosSDK
  ) {
    super(name, experience);

    this.partModuleHandler = new PartModuleHandler(
      PARTS,
      experience,
      CerosSDK,
      name
    );

    this.fuseTypeInfoCollection =
      experience.findComponentsByTag(FUSE_TYPE_INFO);

    this.currentSegment = new Observable("");
    this.subscribeToSegmentChange();
  }

  subscribeToSegmentChange() {
    this.currentSegment.subscribe(this.displayModules.bind(this));
    this.currentSegment.subscribe(this.updateFuseTypeInfo.bind(this));
  }

  registerAnimations() {
    this.fuseTypeInfoCollection.on(
      this.CerosSDK.EVENTS.ANIMATION_STARTED,
      (comp) => {
        if (this.segments[this.currentSegment.value].length) {
          const fuseType =
            this.segments[this.currentSegment.value][0].data[FUSE_TYPE_INFO];
          comp.setText(fuseType);
        }
      }
    );
  }

  displayAnswerOptions(node: Node): void {
    this.mapSegments(node.children);
    this.currentSegment.value = Object.keys(this.segments)[0];
  }

  mapSegments(nodes: Node[]) {
    nodes.forEach((node) => {
      const type = node.data[`fuse type-${PATH2}`].trim();
      this.segments[type] = this.segments[type] || [];
      this.segments[type].push(node);
    });
  }

  displayModules() {
    const length = this.segments[this.currentSegment.value]
      ? this.segments[this.currentSegment.value].length
      : 0;

    if (length) {
      this.updateResultModules(length);

      this.triggerHotspot(PARTS, length, 3);
    } else {
      console.log("No options in segement " + this.currentSegment.value);
    }
  }

  updateFuseTypeInfo() {
    const fuseType =
      this.segments[this.currentSegment.value][0].data[FUSE_TYPE_INFO];

    this.fuseTypeInfoCollection.setText(fuseType);
  }

  updateResultModules(type: number) {
    const nodes = this.segments[this.currentSegment.value];
    nodes.forEach((node, index) => {
      this.partModuleHandler.updateModule(type, index, node.data);
    });
  }

  triggerHotspot(name: string, length: number, max: number) {
    const hotspotCollection = this.experience.findComponentsByTag(
      `${name}-${length <= max ? length : `${max + 1}+`}`
    );

    hotspotCollection.click();
  }

  reset(): void {}
}
