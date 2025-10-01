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
} from "../constants";
import { LandingPageProxy } from "../LandinPageProxy";
import { ModuleHandler } from "./ModuleHandler";
import { Observable } from "../Observer";
import { getModuleTag, isMobile } from "../utils";

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

  processLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string,
    isLittelfusePick?: boolean
  ) {
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

    layersDict["pick"] &&
      this.handleLittelfusePick(layersDict["pick"], !!isLittelfusePick);
  }

  handleLittelfusePick(layerArray: CerosLayer[], isLittelfusePick: boolean) {
    if (isLittelfusePick) {
      layerArray.forEach((l) => l.show());
    } else {
      layerArray.forEach((l) => l.hide());
    }
  }

  imageClickCallback(moduleTag: string) {
    if (!isMobile(this.experience)) {
      const currentObj = this.getResultData(moduleTag);
      this.imgLrgLink.value = currentObj.data.image;
      this.imgLargeHotspotCollection.click();
    }
  }

  registerResultClcikEvent(
    layerArray: CerosLayer[],
    key: string,
    moduleTag: string
  ) {
    layerArray.forEach((layer) => {
      if (this.isNew) {
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
      } else if (isMobile(this.experience) && key === PRODUCT_GUIDE) {
        const dict = this.getResultData(moduleTag);
        if (!dict.data[key]) {
          layer.hide();
        } else {
          layer.show();
        }
      }
    });
  }
}
