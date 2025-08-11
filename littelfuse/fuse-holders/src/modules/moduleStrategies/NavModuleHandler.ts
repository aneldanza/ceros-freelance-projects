import { Observable } from "../Observer";
import { ModuleHandler } from "./ModuleHandler";

export class NavModuleHandler extends ModuleHandler {
  constructor(
    moduleName: string,
    experience: Experience,
    CerosSDK: CerosSDK,
    private currentSegment: Observable<string>
  ) {
    super(moduleName, experience, CerosSDK);
  }
  processLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string
  ): void {
    layersDict["name"] &&
      this.updateResultTextbox("name", moduleTag, layersDict["name"]);

    layersDict["cta"] &&
      this.registerTabChangeCta("name", moduleTag, layersDict["cta"]);
  }

  registerTabChangeCta(
    key: string,
    moduleTag: string,
    layerArray: CerosLayer[]
  ) {
    layerArray.forEach((layer) => {
      layer.on(this.CerosSDK.EVENTS.CLICKED, () => {
        const obj = this.getResultData(moduleTag);
        this.currentSegment.value = obj.data[key];
      });
    });
  }
}
