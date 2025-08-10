import { PARTS } from "../constants";
import { PartModuleHandler } from "../moduleStrategies/PartModuleHander";
import { Node } from "../Node";
import { QuestionStrategy } from "./QuestionStrategy";

export class SegmentedOptionsStrategy extends QuestionStrategy {
  private isMobile: boolean;
  private isTablet: boolean;
  private partModuleHandler: PartModuleHandler;

  constructor(name: string, experience: Experience, CerosSDK: CerosSDK) {
    super(name, experience);

    this.isMobile =
      this.experience.findComponentsByTag("mobile").components.length > 0;

    this.isTablet =
      this.experience.findComponentsByTag("tablet").components.length > 0;

    this.partModuleHandler = new PartModuleHandler(
      PARTS,
      experience,
      CerosSDK,
      name
    );
  }

  displayAnswerOptions(node: Node): void {
    if (this.isMobile || this.isTablet) {
      console.log("MOBILE LAYOUT!");
    } else {
      this.displayDesktopLayoutOptions(node.children);
    }
  }

  displayDesktopLayoutOptions(nodes: Node[]) {
    this.updateResultModules(nodes.length, nodes);

    this.triggerHotspot(PARTS, nodes.length, 3);
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

  reset(): void {}
}
