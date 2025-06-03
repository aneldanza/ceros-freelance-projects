import { QuestionStrategy } from "./QuestionStrategy";
import { Node } from "../Node";

export class HidingOptionsStrategy extends QuestionStrategy {
  private isMobile: boolean;
  private isTablet: boolean;

  constructor(name: string, experience: Experience) {
    super(name, experience);

    this.isMobile =
      this.experience.findComponentsByTag("mobile").components.length > 0;

    this.isTablet =
      this.experience.findComponentsByTag("tablet").components.length > 0;
  }

  displayAnswerOptions(node: Node): void {
    const sortedNodes = node.children.sort(
      (a, b) => Number(a.value) - Number(b.value)
    );

    const evenOptions = this.experience.findLayersByTag(
      `${node.children[0].name.toLowerCase()}_even`
    );
    const oddOptions = this.experience.findLayersByTag(
      `${node.children[0].name.toLowerCase()}_odd`
    );

    if (this.isMobile || this.isTablet) {
      console.log("MOBILE LAYOUT!");
    } else {
      this.displayDesktopLayoutOptions(oddOptions, evenOptions, sortedNodes);
    }
  }

  displayDesktopLayoutOptions(
    oddOptions: CerosLayerCollection,
    evenOptions: CerosLayerCollection,
    sortedNodes: Node[]
  ) {
    if (sortedNodes.length % 2 === 0) {
      oddOptions.hide();
      evenOptions.show();
      this.handleTextOptions(evenOptions, sortedNodes);
    } else {
      oddOptions.show();
      evenOptions.hide();
      this.handleTextOptions(oddOptions, sortedNodes);
    }
  }

  handleTextOptions(options: CerosLayerCollection, nodes: Node[]) {
    const collection = options.layers[0].findAllComponents();

    const max = collection.layersByTag.answer.length;
    const firstIndex = Math.floor((max - nodes.length) / 2);
    let answerIndex = 0;

    collection.components.forEach((comp: CerosComponent) => {
      if (comp.type === "text") {
        const currentIndex = answerIndex - firstIndex;
        if (answerIndex >= firstIndex && currentIndex < nodes.length) {
          comp.setText(nodes[currentIndex].value);
          nodes[currentIndex].elementId = comp.id;
        } else {
          comp.hide();
        }
        answerIndex++;
      } else if (comp.type === "line") {
        this.handleLineDivider(comp, firstIndex, nodes);
      }
    });
  }

  handleLineDivider(comp: CerosComponent, firstIndex: number, nodes: Node[]) {
    const position = !isNaN(Number(comp.getPayload()))
      ? Number(comp.getPayload())
      : null;
    if (position) {
      if (!(position > firstIndex && position - firstIndex < nodes.length)) {
        comp.hide();
      }
    } else {
      console.error(
        `there is no position number in payload of divider line with id ${comp.id} in question ${nodes[0].name}`
      );
    }
  }
}
