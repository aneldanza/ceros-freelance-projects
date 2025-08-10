import { CsvData } from "../quizTypes";
import { getModuleTag } from "../utils";
import { DEFAULT_IMAGE } from "../constants";

export abstract class ModuleHandler {
  public moduleDict: {
    [key: string]: {
      [key: string]: {
        data: CsvData;
        layers: Record<string, CerosLayer[]>;
      };
    };
  } = {};

  protected isNew: boolean = false;

  constructor(
    protected moduleName: string,
    protected experience: Experience,
    protected CerosSDK: CerosSDK
  ) {}

  static handleModuleImage(img: CerosLayer, data: CsvData) {
    const imgStr = data.image;

    try {
      new URL(imgStr);
      img.setUrl(imgStr);
    } catch (e) {
      console.error(e);
      img.setUrl(DEFAULT_IMAGE);
    }
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
    const moduleTag = getModuleTag(type, index, this.moduleName);
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

  abstract processLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string
  ): void;
}
