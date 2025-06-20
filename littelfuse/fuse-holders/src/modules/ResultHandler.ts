import { DESCRIPTION, SPECS } from "./constants";
import { Node } from "./Node";
import { Observable } from "./Observer";
import { LandingPageProxy } from "./LandinPageProxy";

export class ResultHandler {
  private resultModules: any = {};
  private landingPageProxy: LandingPageProxy;

  constructor(
    private experience: Experience,
    private CerosSDK: CerosSDK,
    private currentNodeObservable: Observable<Node>,
    private distributor: string
  ) {
    this.landingPageProxy = new LandingPageProxy();
  }

  showResultModule(type: number) {
    this.updateResultModules(type);

    const moduleResultHotspot = this.experience.findComponentsByTag(
      `module-${type}`
    );
    moduleResultHotspot.click();
  }

  updateModule(type: number, index: number, node: Node) {
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
  }

  updateResultModules(type: number) {
    this.currentNodeObservable.value.children.forEach((node, index) => {
      this.updateModule(type, index, node);
    });
    console.log(this.resultModules);
  }

  getModuleTag(type: number, index: number) {
    return type > 1 ? `${type}-module-${index + 1}` : `${type}-module`;
  }

  processLayers(layersDict: Record<string, CerosLayer[]>, moduleTag: string) {
    layersDict.img &&
      this.showImageFromUrl(moduleTag, this.handleModuleImage, layersDict.img);

    // layersDict.icons &&
    //   this.showResultImage(moduleTag, this.handleModuleIcon, layersDict.icons);

    layersDict.part &&
      this.updateResultTextbox("part", moduleTag, layersDict.part);

    // layersDict.features &&
    //   this.updateResultTextbox("features", moduleTag, layersDict.features);

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

    layersDict[SPECS] &&
      this.updateResultTextbox(SPECS, moduleTag, layersDict[SPECS]);

    layersDict[DESCRIPTION] &&
      this.updateResultTextbox(DESCRIPTION, moduleTag, layersDict[DESCRIPTION]);
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

  showImageFromUrl(
    moduleTag: string,
    callback: (img: CerosLayer, obj: object) => void,
    imgArray: CerosLayer[]
  ) {
    imgArray.forEach((layer) => {
      layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
        const type = moduleTag.split("-")[0];
        const obj = this.resultModules[type][moduleTag];
        callback(layer, obj);
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

        this.landingPageProxy.openAndTrackLink(obj[key], layer.id);
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
    const imgStr = data.image;
    const imgUrl = new URL(imgStr);

    if (imgUrl) {
      img.setUrl(imgStr);
    }
  }
}
