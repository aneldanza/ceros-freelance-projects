import {
  BUY_NOW,
  DATASHEET,
  DESCRIPTION,
  IMAGE,
  IMG_LRG,
  PART,
  PRINT,
  PRODUCT_GUIDE,
  SERIES,
  SPECS,
} from "./constants";
import { LandingPageProxy } from "./LandinPageProxy";
import { Observable } from "./Observer";
import { CsvData } from "./quizTypes";

export class ModuleHandler {
  public moduleDict: {
    [key: string]: {
      [key: string]: {
        data: CsvData;
        layers: Record<string, CerosLayer[]>;
      };
    };
  } = {};

  private isNew: boolean = false;

  private imgLargeHotspotCollection = this.experience.findComponentsByTag(
    `${IMG_LRG}-1`
  );

  constructor(
    private moduleName: string,
    private experience: Experience,
    private CerosSDK: CerosSDK,
    private distributor: string,
    private landingPageProxy: LandingPageProxy,
    private imgLrgLink: Observable<string>
  ) {}

  hideModule(type: number, index: number) {
    const moduleTag = this.getModuleTag(type, index);
    const module = this.experience.findLayersByTag(moduleTag);

    if (!module.layers.length) {
      console.error(`No module found with tag: ${moduleTag}`);
      return;
    }

    module.hide();
  }

  updateModule(
    type: number,
    index: number,
    data: CsvData,
    processOverlayLayers?: (
      layersDict: Record<string, CerosLayer[]>,
      moduleTag: string
    ) => void
  ) {
    const moduleTag = this.getModuleTag(type, index);
    const module = this.experience.findLayersByTag(moduleTag);

    if (!module.layers.length) {
      console.error(`No module found with tag: ${moduleTag}`);
      return;
    }

    const collection = module.layers[0].findAllComponents();
    const layersDict = collection.layersByTag;

    const size = type.toString();

    this.moduleDict[size] = this.moduleDict[size] || {};
    this.isNew = !this.moduleDict[size][moduleTag];

    // Ensure the entry exists before assignment
    if (!this.moduleDict[size][moduleTag]) {
      this.moduleDict[size][moduleTag] = { data: {} as CsvData, layers: {} };
    }

    this.moduleDict[size][moduleTag].data = data;
    this.moduleDict[size][moduleTag].layers = layersDict;

    this.processLayers(layersDict, moduleTag);
    processOverlayLayers && processOverlayLayers(layersDict, moduleTag);

    console.log(this.moduleDict);

    module.show();
  }

  getModuleTag(type: number, index: number) {
    return type > 1
      ? `${type}-${this.moduleName}-${index + 1}`
      : `${type}-${this.moduleName}`;
  }

  processLayers(layersDict: Record<string, CerosLayer[]>, moduleTag: string) {
    layersDict[IMAGE] &&
      this.showImageFromUrl(
        moduleTag,
        ModuleHandler.handleModuleImage,
        layersDict[IMAGE]
      );

    layersDict[PART] &&
      this.updateResultTextbox(PART, moduleTag, layersDict[PART]);

    layersDict[SERIES] &&
      this.updateResultTextbox(SERIES, moduleTag, layersDict[SERIES]);

    layersDict[DATASHEET] &&
      this.registerResultClcikEvent(
        layersDict[DATASHEET],
        DATASHEET,
        moduleTag
      );

    layersDict[PRINT] &&
      this.registerResultClcikEvent(layersDict[PRINT], PRINT, moduleTag);

    layersDict[BUY_NOW] &&
      this.registerResultClcikEvent(
        layersDict[BUY_NOW],
        this.distributor,
        moduleTag
      );

    layersDict[PRODUCT_GUIDE] &&
      this.registerResultClcikEvent(
        layersDict[PRODUCT_GUIDE],
        PRODUCT_GUIDE,
        moduleTag
      );

    layersDict[SPECS] &&
      this.updateResultTextbox(SPECS, moduleTag, layersDict[SPECS]);

    layersDict[DESCRIPTION] &&
      this.updateResultTextbox(DESCRIPTION, moduleTag, layersDict[DESCRIPTION]);
  }

  showImageFromUrl(
    moduleTag: string,
    callback: (img: CerosLayer, obj: CsvData) => void,
    imgArray: CerosLayer[]
  ) {
    imgArray.forEach((layer) => {
      const obj = this.getResultData(moduleTag);
      callback(layer, obj.data);

      this.isNew &&
        layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
          const obj = this.getResultData(moduleTag);
          callback(layer, obj.data);
        });

      this.isNew &&
        layer.on(this.CerosSDK.EVENTS.CLICKED, (layer) => {
          const currentObj = this.getResultData(moduleTag);
          this.imgLrgLink.value = currentObj.data.image;
          this.imgLargeHotspotCollection.click();
        });
    });
  }

  updateResultTextbox(
    key: string,
    moduleTag: string,
    txtboxArray: CerosLayer[]
  ) {
    txtboxArray.forEach((layer) => {
      const obj = this.getResultData(moduleTag);
      layer.setText(obj.data[key]);

      this.isNew &&
        layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (txtBox) => {
          const obj = this.getResultData(moduleTag);
          txtBox.setText(obj.data[key]);
        });
    });
  }

  registerResultClcikEvent(
    layerArray: CerosLayer[],
    key: string,
    moduleTag: string
  ) {
    layerArray.forEach((layer) => {
      layer.on(this.CerosSDK.EVENTS.CLICKED, () => {
        const obj = this.getResultData(moduleTag);

        this.landingPageProxy.openAndTrackLink(obj.data[key], layer.id);
      });

      layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
        const dict = this.getResultData(moduleTag);
        if (!dict.data[key]) {
          layer.hide();
        }
      });
    });
  }

  static handleModuleImage(img: CerosLayer, data: CsvData) {
    const imgStr = data.image;

    try {
      new URL(imgStr);
      img.setUrl(imgStr);
    } catch (e) {
      console.error(e);
      img.setUrl(
        "https://admin.ceros.com/v1/account/littelfuse/images/2025-06-17-60ecf7d1a494b7d0760c289a69b27a44-product-image-place-holder-jpg/proxy"
      );
    }
  }

  getResultData(moduleTag: string) {
    const type = moduleTag.split("-")[0];
    return this.moduleDict[type][moduleTag];
  }
}
