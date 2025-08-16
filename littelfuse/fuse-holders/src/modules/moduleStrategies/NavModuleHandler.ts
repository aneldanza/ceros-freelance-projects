import { NonStrictObservable } from "../Observer";
import { ModuleHandler } from "./ModuleHandler";

export class NavModuleHandler extends ModuleHandler {
  constructor(
    moduleName: string,
    experience: Experience,
    CerosSDK: CerosSDK,
    private currentSegment: NonStrictObservable<string>,
    private textFormat?: (val: string) => string
  ) {
    super(moduleName, experience, CerosSDK);
  }
  processLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string
  ): void {
    layersDict["name"] &&
      this.updateResultTextbox(
        "name",
        moduleTag,
        layersDict["name"],
        this.textFormat
      );

    layersDict["cta"] &&
      this.registerTabChangeCta("name", moduleTag, layersDict["cta"]);
  }

  selectTab(tabName: string, length: string) {
    const modules = this.moduleDict[length];

    for (const moduleTag in modules) {
      const module = modules[moduleTag];
      if (module.data.name === tabName) {
        module.layers.cta.forEach((layer) => {
          layer.click();
          console.log(`clicked ${tabName}`);
        });
      }
    }
  }

  registerTabChangeCta(
    key: string,
    moduleTag: string,
    layerArray: CerosLayer[]
  ) {
    layerArray.forEach((layer) => {
      layer.on(this.CerosSDK.EVENTS.CLICKED, (layer) => {
        if (this.doubleClickBugHandler.isDoubleClickBug(layer.id)) return;
        const obj = this.getResultData(moduleTag);
        this.currentSegment.value = obj.data[key];
      });
    });
  }
}
