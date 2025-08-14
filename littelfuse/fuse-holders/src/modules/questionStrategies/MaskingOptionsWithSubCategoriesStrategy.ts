import { MaskingOptionsStrategy } from "./MaskingOptionsStrategy";
import { Node } from "../lib/Node";

export class MaskingOptionsWithSubcategoriesStrategy extends MaskingOptionsStrategy {
  displayAnswerOptions(node: Node): void {
    console.log(node.name);
    const categoryLayersCollection = this.experience.findLayersByTag(
      `cat:${node.children[0].name}`
    );

    categoryLayersCollection.layers.forEach((layer: CerosLayer) => {
      if (layer.getPayload().trim() === node.value) {
        layer.show();
      } else {
        layer.hide();
      }
    });

    this.maskCollection.layers.forEach((comp: CerosLayer) => {
      this.handleMasks(comp, node);
    });
  }
}
