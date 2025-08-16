import { NavModuleHandler } from "./NavModuleHandler";
import { NonStrictObservable } from "../Observer";
import { Node } from "../lib/Node";

export class TabNavHandler {
  private navModuleHandler: NavModuleHandler;
  private tabTextComponentCollection: CerosComponentCollection;
  public currentSegment: NonStrictObservable<string>;

  public segments: {
    [key: string]: {
      nodes: Node[];
      nav: { [key: string]: CerosComponentCollection };
    };
  } = {};
  constructor(
    private experience: Experience,
    private CerosSDK: CerosSDK,
    private showResultModule: (length: number, nodes: Node[]) => void,
    private tabTag: string,
    private tabTextTag: string,
    private tabKey: string,
    private textFormat?: (val: string) => string
  ) {
    this.currentSegment = new NonStrictObservable("");

    this.navModuleHandler = new NavModuleHandler(
      tabTag,
      experience,
      CerosSDK,
      this.currentSegment,
      this.textFormat
    );

    this.tabTextComponentCollection =
      experience.findComponentsByTag(tabTextTag);

    this.subscribeToSegmentChange();
  }

  init(node: Node) {
    this.segments = {};
    this.mapSegments(node.children);
  }

  subscribeToSegmentChange() {
    this.currentSegment.subscribe(this.displayModules.bind(this));
    this.currentSegment.subscribe(this.updateFuseTypeInfo.bind(this));
  }

  display(): void {
    this.updateNavigation();

    this.triggerHotspot(this.tabTag, Object.keys(this.segments).length, 3);

    const initialValue = Object.keys(this.segments)[0];
    this.navModuleHandler.selectTab(
      initialValue,
      Object.keys(this.segments).length.toString()
    );
  }

  mapSegments(nodes: Node[]) {
    nodes.forEach((node) => {
      const type = node.data[this.tabKey].trim();
      this.segments[type] = this.segments[type] || {};
      this.segments[type].nodes = this.segments[type].nodes || [];
      this.segments[type].nodes.push(node);
    });
  }

  displayModules() {
    const length = this.segments[this.currentSegment.value]
      ? this.segments[this.currentSegment.value].nodes.length
      : 0;

    if (length) {
      this.showResultModule(
        length,
        this.segments[this.currentSegment.value].nodes
      );
    } else {
      console.log("No options in segement " + this.currentSegment.value);
    }
  }

  updateFuseTypeInfo() {
    const fuseType =
      this.segments[this.currentSegment.value].nodes[0].data[this.tabTextTag];

    this.tabTextComponentCollection.setText(fuseType);
  }

  updateNavigation() {
    const length = Object.keys(this.segments).length;

    if (length) {
      this.updateNavModules(length);
      this.triggerHotspot(this.tabTag, length, 3);
    }
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

  isOneTab(nodes: Node[]) {
    const tabName = nodes[0].data[this.tabKey];
    return nodes.every((child) => child.data[this.tabKey] === tabName);
  }
}
