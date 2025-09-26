import {
  FUSE_TYPE_INFO,
  MOBILE_MAX_ITEMS,
  PARTS,
  PATH2,
  SEGMENTS,
} from "../constants";
import { PartModuleHandler } from "../moduleStrategies/PartModuleHandler";
import { Node } from "../lib/Node";
import { QuestionStrategy } from "./QuestionStrategy";
import { TabNavHandler } from "../moduleStrategies/TabNavHandler";
import { Carousel } from "../Carousel";
import { isMobile } from "../utils";

export class SegmentedOptionsStrategy extends QuestionStrategy {
  private partModuleHandler: PartModuleHandler;
  private tabNavHandler: TabNavHandler;
  private partsCarousel: Carousel;
  private maxParts: number = 3;

  constructor(name: string, experience: Experience, CerosSDK: CerosSDK) {
    super(name, experience, CerosSDK);

    this.partModuleHandler = new PartModuleHandler(
      PARTS,
      experience,
      CerosSDK,
      name,
      this.selectedOption
    );

    this.tabNavHandler = new TabNavHandler(
      experience,
      CerosSDK,
      this.showResultModules.bind(this),
      SEGMENTS,
      FUSE_TYPE_INFO,
      `fuse type-${PATH2}`
    );

    this.maxParts = isMobile(experience) ? MOBILE_MAX_ITEMS : 3;

    this.partsCarousel = new Carousel(
      this.maxParts,
      PARTS,
      CerosSDK,
      experience,
      this.partModuleHandler
    );
  }

  displayAnswerOptions(node: Node): void {
    this.tabNavHandler.init(node);
    this.tabNavHandler.display();
  }

  showResultModules(length: number, nodes: Node[]) {
    this.updateResultModules(length, nodes);

    this.triggerHotspot(PARTS, length, this.maxParts);
  }

  updateResultModules(length: number, nodes: Node[]) {
    if (length <= this.maxParts) {
      nodes.forEach((node, index) => {
        this.partModuleHandler.updateModule(length, index, node.data);
      });
    } else {
      this.partsCarousel.init(nodes.map((node) => node.data));
    }
  }

  triggerHotspot(name: string, length: number, max: number) {
    const hotspotCollection = this.experience.findComponentsByTag(
      `${name}-${length <= max ? length : `${max + 1}+`}`
    );

    hotspotCollection.click();
  }
}
