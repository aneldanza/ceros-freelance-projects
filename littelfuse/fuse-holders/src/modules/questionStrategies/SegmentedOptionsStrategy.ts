import { FUSE_TYPE_INFO, PARTS, PATH2, SEGMENTS } from "../constants";
import { NavModuleHandler } from "../moduleStrategies/NavModuleHandler";
import { PartModuleHandler } from "../moduleStrategies/PartModuleHander";
import { Node } from "../Node";
import { Observable } from "../Observer";
import { QuestionStrategy } from "./QuestionStrategy";

export class SegmentedOptionsStrategy extends QuestionStrategy {
  private partModuleHandler: PartModuleHandler;
  private navModuleHandler: NavModuleHandler;
  private fuseTypeInfoCollection: CerosComponentCollection;
  private currentSegment: Observable<string>;
  private segments: {
    [key: string]: {
      nodes: Node[];
      nav: { [key: string]: CerosComponentCollection };
    };
  } = {};

  constructor(
    name: string,
    experience: Experience,
    private CerosSDK: CerosSDK
  ) {
    super(name, experience);

    this.currentSegment = new Observable("");

    this.partModuleHandler = new PartModuleHandler(
      PARTS,
      experience,
      CerosSDK,
      name
    );

    this.navModuleHandler = new NavModuleHandler(
      SEGMENTS,
      experience,
      CerosSDK,
      this.currentSegment
    );

    this.fuseTypeInfoCollection =
      experience.findComponentsByTag(FUSE_TYPE_INFO);

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
        if (this.segments[this.currentSegment.value].nodes.length) {
          const fuseType =
            this.segments[this.currentSegment.value].nodes[0].data[
              FUSE_TYPE_INFO
            ];
          comp.setText(fuseType);
        }
      }
    );
  }

  displayAnswerOptions(node: Node): void {
    this.segments = {};
    this.mapSegments(node.children);
    this.updateNavigation();

    this.triggerHotspot(SEGMENTS, Object.keys(this.segments).length, 3);

    this.currentSegment.value = Object.keys(this.segments)[0];
  }

  mapSegments(nodes: Node[]) {
    nodes.forEach((node) => {
      const type = node.data[`fuse type-${PATH2}`].trim();
      this.segments[type] = this.segments[type] || {};
      this.segments[type].nodes = this.segments[type].nodes || [];
      this.segments[type].nodes.push(node);
    });
  }

  updateNavigation() {
    const length = Object.keys(this.segments).length;

    if (length) {
      this.updateNavModules(length);
      this.triggerHotspot(SEGMENTS, length, 3);
    }
  }

  displayModules() {
    const length = this.segments[this.currentSegment.value]
      ? this.segments[this.currentSegment.value].nodes.length
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
      this.segments[this.currentSegment.value].nodes[0].data[FUSE_TYPE_INFO];

    this.fuseTypeInfoCollection.setText(fuseType);
  }

  updateResultModules(type: number) {
    const nodes = this.segments[this.currentSegment.value].nodes;
    nodes.forEach((node, index) => {
      this.partModuleHandler.updateModule(type, index, node.data);
    });
  }

  updateNavModules(length: number) {
    const fuseTypes = Object.keys(this.segments);
    fuseTypes.forEach((fuseType, index) => {
      this.navModuleHandler.updateModule(length, index, { name: fuseType });
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
