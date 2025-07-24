import { Node } from "../Node";
import { MaskingOptionsStrategy } from "./MaskingOptionsStrategy";

export class MaskingOptionsStrategyWithMultipleCellValues extends MaskingOptionsStrategy {
  handleMasks(mask: CerosLayer, node: Node): void {
    const foundNode = node.findChildThatIncludesValue(mask.getPayload().trim());

    if (foundNode) {
      mask.hide();
    } else {
      mask.show();
    }
  }
}
