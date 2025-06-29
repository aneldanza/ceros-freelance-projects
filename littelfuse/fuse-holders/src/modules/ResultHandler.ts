import { DESCRIPTION, DIVIDER, RELATED_PRODUCTS, SPECS } from "./constants";
import { Node } from "./Node";
import { Observable } from "./Observer";
import { LandingPageProxy } from "./LandinPageProxy";
import { CsvData, ResultData } from "./quizTypes";
import { ModuleHandler } from "./ModuleHandler";
import { DoubleClickBugHandler } from "./DoubleClickBugHandler";

export class ResultHandler {
  private resultModules: {
    [key: string]: {
      [key: string]: ResultData;
    };
  } = {};
  private landingPageProxy: LandingPageProxy;

  private csvData: Record<string, Record<string, CsvData>> = {};
  private resultModulesHandler: ModuleHandler;
  private relatedProductsModulesHandler: ModuleHandler;
  private doubleClickBugHandler: DoubleClickBugHandler =
    new DoubleClickBugHandler();

  constructor(
    private experience: Experience,
    private CerosSDK: CerosSDK,
    private currentNodeObservable: Observable<Node>,
    private distributor: string,
    private relatedProductsLink: string,
    private accessoriesLink: string,
    private PapaParse: typeof window.Papa
  ) {
    this.landingPageProxy = new LandingPageProxy();
    this.resultModulesHandler = new ModuleHandler(
      "module",
      experience,
      CerosSDK,
      distributor,
      this.landingPageProxy
    );

    this.relatedProductsModulesHandler = new ModuleHandler(
      RELATED_PRODUCTS,
      experience,
      CerosSDK,
      distributor,
      this.landingPageProxy
    );
  }

  showResultModule(type: number) {
    this.updateResultModules(type);

    const moduleResultHotspot = this.experience.findComponentsByTag(
      `module-${type}`
    );
    moduleResultHotspot.click();
  }

  processOverlayLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string
  ) {
    layersDict[RELATED_PRODUCTS] &&
      this.handleOverlay(
        RELATED_PRODUCTS,
        layersDict[RELATED_PRODUCTS],
        moduleTag,
        this.relatedProductsLink
      );
  }

  updateResultModules(type: number) {
    this.currentNodeObservable.value.children.forEach((node, index) => {
      this.resultModulesHandler.updateModule(
        type,
        index,
        node.data,
        this.processOverlayLayers.bind(this)
      );
    });
  }

  updateRelatedProductsModules(size: number, name: string, items: string[]) {
    const data = this.csvData[name];
    items.forEach((part, index) => {
      this.relatedProductsModulesHandler.updateModule(size, index, data[part]);
    });
  }

  handleOverlay(
    name: string,
    layerArray: CerosLayer[],
    moduleTag: string,
    link: string
  ) {
    layerArray.forEach((layer) => {
      this.registerOverlayAnimation(layer, moduleTag, name);

      this.registerOverlayClick(layer, moduleTag, name, link);
    });
  }

  registerOverlayAnimation(layer: CerosLayer, moduleTag: string, name: string) {
    layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
      const items = this.getRelatedParts(moduleTag, name);
      if (items.length === 0) {
        layer.hide();
      }
    });
  }

  getRelatedParts(moduleTag: string, name: string) {
    const dict = this.resultModulesHandler.getResultData(moduleTag);
    const value = dict.data[name];
    const items = value ? value.split(DIVIDER).map((str) => str.trim()) : [];
    return items;
  }

  registerOverlayClick(
    layer: CerosLayer,
    moduleTag: string,
    name: string,
    link: string
  ) {
    layer.on(this.CerosSDK.EVENTS.CLICKED, async (layer) => {
      if (this.doubleClickBugHandler.isDoubleClickBug(layer.id)) return;

      const items = this.getRelatedParts(moduleTag, name);

      if (!items.length) return;

      await this.loadCsvData(name, link);

      console.log(this.csvData[name]);

      this.updateRelatedProductsModules(items.length, name, items);

      const hotspotCollection = this.experience.findComponentsByTag(
        `${name}-${items.length}`
      );

      hotspotCollection.click();
    });
  }

  loadCsvData(name: string, link: string) {
    return new Promise<{
      [key: string]: Record<string, string>;
    }>((resolve, reject) => {
      if (this.csvData[name] && Object.keys(this.csvData[name]).length > 0) {
        resolve(this.csvData[name]);
      } else {
        this.PapaParse.parse(link, {
          header: true,
          download: true,
          complete: (results) => {
            const data = this.indexByPartNumber(results.data);
            this.csvData[name] = data;
            resolve(this.csvData[name]);
          },
          error: (error: any) => reject(error),
        });
      }
    });
  }

  indexByPartNumber(data: Record<string, string>[]) {
    const result: { [key: string]: Record<string, string> } = {};
    data.forEach((obj) => {
      result[obj.part] = obj;
    });
    return result;
  }
}
