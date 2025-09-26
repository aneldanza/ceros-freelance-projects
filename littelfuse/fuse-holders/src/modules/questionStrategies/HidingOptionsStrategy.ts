import { QuestionStrategy } from "./QuestionStrategy";
import { Node } from "../lib/Node";
import { isMobile } from "../utils";

export class HidingOptionsStrategy extends QuestionStrategy {
  private isMobile: boolean;
  private isTablet: boolean;
  private evenOptions: CerosLayerCollection;
  private oddOptions: CerosLayerCollection;

  constructor(name: string, experience: Experience, CerosSDK: CerosSDK) {
    super(name, experience, CerosSDK);
    this.key = "elementId";

    this.isMobile = isMobile(experience);

    this.isTablet =
      this.experience.findComponentsByTag("tablet").components.length > 0;

    this.evenOptions = this.experience.findLayersByTag(
      `${name.toLowerCase()}_even`
    );

    this.oddOptions = this.experience.findLayersByTag(
      `${name.toLowerCase()}_odd`
    );

    this.registerCerosEvents();
  }

  registerCerosEvents() {
    this.optionsCollection.on(
      this.CerosSDK.EVENTS.CLICKED,
      this.handleOptionClick.bind(this)
    );
  }

  handleOptionClick(comp: CerosComponent): void {
    const answer = comp.id;
    const array = this.selectedOption.value.split(":");
    array[1] = this.key;
    array[2] = answer;
    this.selectedOption.value = array.join(":");
  }

  displayAnswerOptions(node: Node): void {
    const sortedNodes = node.children.sort(
      (a, b) => Number(a.value) - Number(b.value)
    );

    if (this.isMobile || this.isTablet) {
      console.log("MOBILE LAYOUT!");
      // there are two possible rows available
      // each row has odd or even option: odd - 1 or 3 items, even - 2 items
      // divide sorted nodes between the rows
      //  call displayMobileOptions for each row

      let firstRowNodes: Node[] = [];
      let secondRowNodes: Node[] = [];

      if (sortedNodes.length % 2 === 0) {
        firstRowNodes = sortedNodes.slice(0, 2);
        secondRowNodes = sortedNodes.slice(2);
      } else {
        firstRowNodes = sortedNodes.slice(0, 3);
        secondRowNodes = sortedNodes.slice(3);
      }

      this.displayMobileLayoutOptions(firstRowNodes, 1);

      secondRowNodes.length
        ? this.displayMobileLayoutOptions(secondRowNodes, 2)
        : this.hideMobileOptionsRow(2);
    } else {
      this.displayLayoutOptions(sortedNodes, this.handleTextOptions);
    }
  }

  hideMobileOptionsRow(rowNum: 2) {
    const oddOptions = this.experience.findLayersByTag(
      `${this.name}-${rowNum}-odd`
    );
    const evenOptions = this.experience.findLayersByTag(
      `${this.name}-${rowNum}-even`
    );

    oddOptions.hide();
    evenOptions.hide();
  }

  displayMobileLayoutOptions(sortedNodes: Node[], rowNum: number) {
    const oddOptions = this.experience.findLayersByTag(
      `${this.name}-${rowNum}-odd`
    );
    const evenOptions = this.experience.findLayersByTag(
      `${this.name}-${rowNum}-even`
    );

    if (sortedNodes.length % 2 === 0) {
      oddOptions.hide();
      evenOptions.show();
      this.handleMobileTextOptions(evenOptions, sortedNodes);
    } else {
      oddOptions.show();
      evenOptions.hide();
      this.handleMobileTextOptions(oddOptions, sortedNodes);
    }
  }

  displayLayoutOptions(
    sortedNodes: Node[],
    handleOptions: (options: CerosLayerCollection, nodes: Node[]) => void
  ) {
    if (sortedNodes.length % 2 === 0) {
      this.oddOptions.hide();
      this.evenOptions.show();
      handleOptions(this.evenOptions, sortedNodes);
    } else {
      this.oddOptions.show();
      this.evenOptions.hide();
      handleOptions(this.oddOptions, sortedNodes);
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
    const position = Number(comp.getPayload());

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

  handleMobileTextOptions(options: CerosLayerCollection, nodes: Node[]) {
    const collection = options.layers[0].findAllComponents();

    if (nodes.length === 1) {
      this.handleOneOptionInMobileView(nodes, collection);
    } else {
      this.handleTextOptions(options, nodes);
    }
  }

  handleOneOptionInMobileView(
    nodes: Node[],
    collection: CerosComponentCollection
  ) {
    let answerIndex = 0;
    collection.layers.forEach((layer) => {
      if (layer.type === "text") {
        if (answerIndex === 1) {
          layer.setText(nodes[0].value);
          nodes[0].elementId = layer.id;
        } else {
          layer.hide();
        }
        answerIndex++;
      } else {
        layer.hide();
      }
    });
  }
}
