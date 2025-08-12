import { ModuleHandler } from "./ModuleHandler";
import { FUSE_STYLE_INFO, IMAGE } from "../constants";
import { CsvData } from "../quizTypes";
import { setImageUrl } from "../utils";
import { NonStrictObservable } from "../Observer";

export class PartModuleHandler extends ModuleHandler {
  constructor(
    moduleName: string,
    experience: Experience,
    CerosSDK: CerosSDK,
    private qName: string,
    private selectedOption: NonStrictObservable<string>
  ) {
    super(moduleName, experience, CerosSDK);
  }

  processLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string
  ): void {
    console.log("proccessing part layers");
    layersDict[IMAGE] &&
      this.showImageFromUrl(
        moduleTag,
        this.displayPartImage.bind(this),
        layersDict[IMAGE]
      );

    layersDict[this.qName] &&
      this.updateResultTextbox(this.qName, moduleTag, layersDict[this.qName]);

    layersDict[FUSE_STYLE_INFO] &&
      this.updateResultTextbox(
        FUSE_STYLE_INFO,
        moduleTag,
        layersDict[FUSE_STYLE_INFO]
      );

    layersDict[`q:${this.qName}`] &&
      this.registerOptionClick(
        this.qName,
        moduleTag,
        layersDict[`q:${this.qName}`]
      );
  }

  registerOptionClick(
    key: string,
    moduleTag: string,
    layerArray: CerosLayer[]
  ) {
    layerArray.forEach((layer) => {
      layer.on(this.CerosSDK.EVENTS.CLICKED, () => {
        const obj = this.getResultData(moduleTag);
        const answer = obj.data[key];

        const array = this.selectedOption.value.split(":");

        array[2] = answer;
        this.selectedOption.value = array.join(":");
      });
    });
  }

  displayPartImage(imgLayer: CerosLayer, data: CsvData) {
    const strUrl = data[`${this.qName.split("-")[0]} image`];
    setImageUrl(strUrl, imgLayer);
  }
}
