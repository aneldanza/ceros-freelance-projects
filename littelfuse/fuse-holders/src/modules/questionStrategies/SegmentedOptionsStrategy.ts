import { FUSE_TYPE_INFO, PARTS, PATH2, SEGMENTS } from "../constants";
import { PartModuleHandler } from "../moduleStrategies/PartModuleHandler";
import { Node } from "../lib/Node";
import { QuestionStrategy } from "./QuestionStrategy";
import { TabNavHandler } from "./TabNavHandler";

export class SegmentedOptionsStrategy extends QuestionStrategy {
  private partModuleHandler: PartModuleHandler;
  private tabNavHandler: TabNavHandler;

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
      "FUSE_TYPE_INFO",
      `fuse type-${PATH2}`
    );
  }

  displayAnswerOptions(node: Node): void {
    this.tabNavHandler.init(node);
    this.tabNavHandler.display();
  }

  showResultModules(length: number, nodes: Node[]) {
    this.updateResultModules(length, nodes);

    this.triggerHotspot(PARTS, length, 3);
  }

  updateResultModules(type: number, nodes: Node[]) {
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
}
