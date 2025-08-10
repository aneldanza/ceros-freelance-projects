import { CsvData } from "../quizTypes";
import { getModuleTag, setImageUrl } from "../utils";
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

    setImageUrl(imgStr, img);
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

  showImageFromUrl(
    moduleTag: string,
    callback: (img: CerosLayer, obj: CsvData) => void,
    imgArray: CerosLayer[],
    onClickCallback?: (moduleTag: string) => void
  ) {
    imgArray.forEach((layer) => {
      const obj = this.getResultData(moduleTag);
      callback(layer, obj.data);

      this.isNew &&
        layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
          const obj = this.getResultData(moduleTag);
          callback(layer, obj.data);
        });

      onClickCallback &&
        this.isNew &&
        layer.on(this.CerosSDK.EVENTS.CLICKED, (layer) => {
          onClickCallback(moduleTag);
        });
    });
  }

  getResultData(moduleTag: string) {
    const type = moduleTag.split("-")[0];
    return this.moduleDict[type][moduleTag];
  }

  abstract processLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string
  ): void;
}
