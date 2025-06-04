import { Node } from "./Node";
import { Observable } from "./Observer";

export class ResultHandler {
  private resultModules: any = {};

  constructor(
    private experience: Experience,
    private CerosSDK: CerosSDK,
    private currentNodeObservable: Observable<Node>,
    private distributor: string
  ) {}

  showResultModule(type: number) {
    this.updateModuleResults(type);

    const moduleResultHotspot = this.experience.findComponentsByTag(
      `module-${type}`
    );
    moduleResultHotspot.click();
  }

  updateModuleResults(type: number) {
    this.currentNodeObservable.value.children.forEach((node, index) => {
      const moduleTag = this.getModuleTag(type, index);
      const module = this.experience.findLayersByTag(moduleTag);
      if (!module.layers.length) {
        console.error(`No module found with tag: ${moduleTag}`);
        return;
      }

      const collection = module.layers[0].findAllComponents();
      const layersDict = collection.layersByTag;

      const data = node.data;
      const size = type.toString();
      if (this.resultModules.size && this.resultModules[size][moduleTag]) {
        this.resultModules[size] = this.resultModules[size] || {};
        this.resultModules[size][moduleTag] = data;
      } else {
        this.resultModules[size] = this.resultModules[size] || {};
        this.resultModules[size][moduleTag] = data;

        this.processLayers(layersDict, moduleTag);
      }

      console.log(this.resultModules);
    });
  }

  getModuleTag(type: number, index: number) {
    return type > 1 ? `${type}-module-${index + 1}` : `${type}-module`;
  }

  processLayers(layersDict: Record<string, CerosLayer[]>, moduleTag: string) {
    layersDict.images &&
      this.showResultImage(
        moduleTag,
        this.handleModuleImage,
        layersDict.images
      );

    layersDict.icons &&
      this.showResultImage(moduleTag, this.handleModuleIcon, layersDict.icons);

    layersDict.part &&
      this.updateResultTextbox("part", moduleTag, layersDict.part);

    layersDict.features &&
      this.updateResultTextbox("features", moduleTag, layersDict.features);

    layersDict.datasheet &&
      this.registerResultClcikEvent(
        layersDict.datasheet,
        "datasheet",
        moduleTag
      );

    layersDict["buy-now"] &&
      this.registerResultClcikEvent(
        layersDict["buy-now"],
        this.distributor,
        moduleTag
      );

    layersDict.specs &&
      this.updateResultTextbox("specs", moduleTag, layersDict.specs);
  }

  showResultImage(
    moduleTag: string,
    callback: (img: CerosLayer, obj: object) => void,
    imgArray: CerosLayer[]
  ) {
    imgArray.forEach((layer) => {
      layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (group) => {
        const type = moduleTag.split("-")[0];
        const obj = this.resultModules[type][moduleTag];
        const images = group.findAllComponents();
        images.layers.forEach((img) => callback(img, obj));
      });
    });
  }

  updateResultTextbox(
    key: string,
    moduleTag: string,
    txtboxArray: CerosLayer[]
  ) {
    txtboxArray.forEach((layer) => {
      layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (txtBox) => {
        const type = moduleTag.split("-")[0];
        const obj = this.resultModules[type][moduleTag];
        txtBox.setText(obj[key]);
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
        const type = moduleTag.split("-")[0];
        const obj = this.resultModules[type][moduleTag];

        //   this.landingPageProxy.openAndTrackLink(
        //     obj[key],
        //     this.utils.isDoubleClickBug.bind(this.utils)
        //   );
      });
    });
  }

  handleModuleIcon(icon: CerosLayer, data: any) {
    if (
      data["application"]
        .toLowerCase()
        .includes(icon.getPayload().toLowerCase())
    ) {
      icon.show();
    } else {
      icon.hide();
    }
  }

  handleModuleImage(img: CerosLayer, data: any) {
    const tag = data["image"].split(".")[0].trim();
    if (tag.toLowerCase() === img.getPayload().toLowerCase()) {
      img.show();
    } else {
      img.hide();
    }
  }
}
