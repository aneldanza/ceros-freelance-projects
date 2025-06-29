import { DESCRIPTION, DIVIDER, RELATED_PRODUCTS, SPECS } from "./constants";
import { Node } from "./Node";
import { Observable } from "./Observer";
import { LandingPageProxy } from "./LandinPageProxy";
import { CsvData, ResultData } from "./quizTypes";
import { ModuleHandler } from "./ModuleHandler";

export class ResultHandler {
  private resultModules: {
    [key: string]: {
      [key: string]: ResultData;
    };
  } = {};
  private landingPageProxy: LandingPageProxy;

  private relatedProductsData: CsvData = {};
  private csvData: Record<string, Record<string, CsvData>> = {};
  private resultModulesHandler: ModuleHandler;

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
  }

  showResultModule(type: number) {
    this.updateResultModules(type);

    const moduleResultHotspot = this.experience.findComponentsByTag(
      `module-${type}`
    );
    moduleResultHotspot.click();
  }

  // updateModule(type: number, index: number, node: Node) {
  //   const moduleTag = this.getModuleTag(type, index);
  //   const module = this.experience.findLayersByTag(moduleTag);
  //   if (!module.layers.length) {
  //     console.error(`No module found with tag: ${moduleTag}`);
  //     return;
  //   }

  //   const collection = module.layers[0].findAllComponents();
  //   const layersDict = collection.layersByTag;

  //   const data = node.data;
  //   const size = type.toString();
  //   if (this.resultModules.size && this.resultModules[size][moduleTag]) {
  //     this.resultModules[size] = this.resultModules[size] || {};
  //     this.resultModules[size][moduleTag] = data;
  //   } else {
  //     this.resultModules[size] = this.resultModules[size] || {};
  //     this.resultModules[size][moduleTag] = data;

  //     this.processLayers(layersDict, moduleTag);
  //   }
  // }

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
        this.processOverlayLayers
      );
    });
  }

  // getModuleTag(type: number, index: number) {
  //   return type > 1 ? `${type}-module-${index + 1}` : `${type}-module`;
  // }

  // processLayers(layersDict: Record<string, CerosLayer[]>, moduleTag: string) {
  //   layersDict.img &&
  //     this.showImageFromUrl(moduleTag, this.handleModuleImage, layersDict.img);

  //   layersDict.part &&
  //     this.updateResultTextbox("part", moduleTag, layersDict.part);

  //   layersDict.series &&
  //     this.updateResultTextbox("series", moduleTag, layersDict.series);

  //   layersDict.datasheet &&
  //     this.registerResultClcikEvent(
  //       layersDict.datasheet,
  //       "datasheet",
  //       moduleTag
  //     );

  //   layersDict["2d print"] &&
  //     this.registerResultClcikEvent(
  //       layersDict.datasheet,
  //       "2d print",
  //       moduleTag
  //     );

  //   layersDict["buy-now"] &&
  //     this.registerResultClcikEvent(
  //       layersDict["buy-now"],
  //       this.distributor,
  //       moduleTag
  //     );

  //   layersDict[SPECS] &&
  //     this.updateResultTextbox(SPECS, moduleTag, layersDict[SPECS]);

  //   layersDict[DESCRIPTION] &&
  //     this.updateResultTextbox(DESCRIPTION, moduleTag, layersDict[DESCRIPTION]);

  //   layersDict[RELATED_PRODUCTS] &&
  //     this.handleOverlay(
  //       RELATED_PRODUCTS,
  //       layersDict[RELATED_PRODUCTS],
  //       moduleTag,
  //       this.relatedProductsLink
  //     );
  // }

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
    layer.on(this.CerosSDK.EVENTS.CLICKED, async () => {
      const items = this.getRelatedParts(moduleTag, name);

      if (!items.length) return;

      await this.loadCsvData(name, link);

      console.log(this.csvData[name]);

      const hotspotCollection = this.experience.findComponentsByTag(
        `${name}-${items.length}`
      );

      hotspotCollection.click();
    });
  }

  registerOverlayModule(name: string, items: string[]) {}

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

  // showImageFromUrl(
  //   moduleTag: string,
  //   callback: (img: CerosLayer, obj: object) => void,
  //   imgArray: CerosLayer[]
  // ) {
  //   imgArray.forEach((layer) => {
  //     layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
  //       const obj = this.getResultData(moduleTag);
  //       callback(layer, obj);
  //     });
  //   });
  // }

  // updateResultTextbox(
  //   key: string,
  //   moduleTag: string,
  //   txtboxArray: CerosLayer[]
  // ) {
  //   txtboxArray.forEach((layer) => {
  //     const obj = this.getResultData(moduleTag);
  //     layer.setText(obj[key]);

  //     layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (txtBox) => {
  //       const obj = this.getResultData(moduleTag);
  //       txtBox.setText(obj[key]);
  //     });
  //   });
  // }

  // registerResultClcikEvent(
  //   layerArray: CerosLayer[],
  //   key: string,
  //   moduleTag: string
  // ) {
  //   layerArray.forEach((layer) => {
  //     layer.on(this.CerosSDK.EVENTS.CLICKED, () => {
  //       const obj = this.getResultData(moduleTag);

  //       this.landingPageProxy.openAndTrackLink(obj[key], layer.id);
  //     });
  //   });
  // }

  // handleModuleImage(img: CerosLayer, data: any) {
  //   const imgStr = data.image;

  //   try {
  //     const imgUrl = new URL(imgStr);
  //     img.setUrl(imgStr);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  // getResultData(moduleTag: string) {
  //   const type = moduleTag.split("-")[0];
  //   return this.resultModules[type][moduleTag];
  // }
}
