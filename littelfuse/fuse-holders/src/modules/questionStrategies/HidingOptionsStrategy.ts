import { QuestionStrategy } from "./QuestionStrategy";
import { Node } from "../Node";
import { Observable } from "../Observer";

export class HidingOptionsStrategy extends QuestionStrategy {
  private isMobile: boolean;
  private isTablet: boolean;
  private evenOptions: CerosLayerCollection;
  private oddOptions: CerosLayerCollection;

  constructor(
    name: string,
    experience: Experience,
    private currentNodeObservable: Observable<Node>,
    private CerosSDK: CerosSDK
  ) {
    super(name, experience);

    this.isMobile =
      this.experience.findComponentsByTag("mobile").components.length > 0;

    this.isTablet =
      this.experience.findComponentsByTag("tablet").components.length > 0;

    this.evenOptions = this.experience.findLayersByTag(
      `${name.toLowerCase()}_even`
    );

    this.oddOptions = this.experience.findLayersByTag(
      `${name.toLowerCase()}_odd`
    );
  }

  displayAnswerOptions(node: Node): void {
    const sortedNodes = node.children.sort(
      (a, b) => Number(a.value) - Number(b.value)
    );

    if (this.isMobile || this.isTablet) {
      console.log("MOBILE LAYOUT!");
    } else {
      this.displayDesktopLayoutOptions(sortedNodes);
    }
  }

  displayDesktopLayoutOptions(sortedNodes: Node[]) {
    if (sortedNodes.length % 2 === 0) {
      this.oddOptions.hide();
      this.evenOptions.show();
      this.handleTextOptions(this.evenOptions, sortedNodes);
    } else {
      this.oddOptions.show();
      this.evenOptions.hide();
      this.handleTextOptions(this.oddOptions, sortedNodes);
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
