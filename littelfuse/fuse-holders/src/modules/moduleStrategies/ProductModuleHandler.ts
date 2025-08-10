import {
  BUY_NOW,
  DATASHEET,
  DEFAULT_IMAGE,
  DESCRIPTION,
  IMAGE,
  IMG_LRG,
  PART,
  PRINT,
  PRODUCT_GUIDE,
  SERIES,
  SPECS,
} from "../constants";
import { LandingPageProxy } from "../LandinPageProxy";
import { ModuleHandler } from "./ModuleHandler";
import { Observable } from "../Observer";
import { getModuleTag } from "../utils";

export class ProductModuleHandler extends ModuleHandler {
  private imgLargeHotspotCollection = this.experience.findComponentsByTag(
    `${IMG_LRG}-1`
  );

  constructor(
    moduleName: string,
    experience: Experience,
    CerosSDK: CerosSDK,
    private distributor: string,
    private landingPageProxy: LandingPageProxy,
    private imgLrgLink: Observable<string>
  ) {
    super(moduleName, experience, CerosSDK);
  }

  hideModule(type: number, index: number) {
    const moduleTag = getModuleTag(type, index, this.moduleName);
    const module = this.experience.findLayersByTag(moduleTag);

    if (!module.layers.length) {
      console.error(`No module found with tag: ${moduleTag}`);
      return;
    }

    module.hide();
  }

  processLayers(layersDict: Record<string, CerosLayer[]>, moduleTag: string) {
    layersDict[IMAGE] &&
      this.showImageFromUrl(
        moduleTag,
        ModuleHandler.handleModuleImage,
        layersDict[IMAGE],
        this.imageClickCallback.bind(this)
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

  imageClickCallback(moduleTag: string) {
    const currentObj = this.getResultData(moduleTag);
    this.imgLrgLink.value = currentObj.data.image;
    this.imgLargeHotspotCollection.click();
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
}
