import { ModuleHandler } from "./ModuleHandler";

export class PartModuleHandler extends ModuleHandler {
  constructor(moduleName: string, experience: Experience, CerosSDK: CerosSDK) {
    super(moduleName, experience, CerosSDK);
  }

  processLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string
  ): void {
    console.log("proccessing part layers");
  }
}
