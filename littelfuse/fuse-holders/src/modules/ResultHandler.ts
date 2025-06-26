import { DESCRIPTION, DIVIDER, RELATED_PRODUCTS, SPECS } from "./constants";
import { Node } from "./Node";
import { Observable } from "./Observer";
import { LandingPageProxy } from "./LandinPageProxy";
import { ResultData } from "./quizTypes";

export class ResultHandler {
  private resultModules: {
    [key: string]: {
      [key: string]: ResultData;
    };
  } = {};
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
    const type = moduleTag.split("-")[0];
    const data = this.resultModules[type][moduleTag];

    layersDict.img &&
      this.showImageFromUrl(moduleTag, this.handleModuleImage, layersDict.img);

    layersDict.part &&
      this.updateResultTextbox("part", moduleTag, layersDict.part);

    layersDict.series &&
      this.updateResultTextbox("series", moduleTag, layersDict.series);

    layersDict.datasheet &&
      this.registerResultClcikEvent(
        layersDict.datasheet,
        "datasheet",
        moduleTag
      );

    layersDict["2d print"] &&
      this.registerResultClcikEvent(
        layersDict.datasheet,
        "2d print",
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

    layersDict[RELATED_PRODUCTS] &&
      this.handleOverlay(
        RELATED_PRODUCTS,
        layersDict[RELATED_PRODUCTS],
        moduleTag
      );
  }

  handleOverlay(name: string, layerArray: CerosLayer[], moduleTag: string) {
    layerArray.forEach((layer) => {
      this.registerOverlayAnimation(layer, moduleTag, name);

      this.registerOverlayClick(layer, moduleTag, name);
    });
  }

  registerOverlayAnimation(layer: CerosLayer, moduleTag: string, name: string) {
    layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
      const data = this.getData(moduleTag);
      const value = data[name];
      const items = value ? value.split(DIVIDER).map((str) => str.trim()) : [];
      if (items.length === 0) {
        layer.hide();
      }
    });
  }

  registerOverlayClick(layer: CerosLayer, moduleTag: string, name: string) {
    layer.on(this.CerosSDK.EVENTS.CLICKED, () => {
      const data = this.getData(moduleTag);
      const value = data[name];
      const items = value ? value.split(DIVIDER).map((str) => str.trim()) : [];
      const hotspotCollection = this.experience.findComponentsByTag(
        `${name}-${items.length}`
      );
      hotspotCollection.click();
    });
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
      const type = moduleTag.split("-")[0];
      const obj = this.resultModules[type][moduleTag];
      layer.setText(obj[key]);

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

    try {
      const imgUrl = new URL(imgStr);
      img.setUrl(imgStr);
    } catch (e) {
      console.error(e);
    }
  }

  getData(moduleTag: string) {
    const type = moduleTag.split("-")[0];
    return this.resultModules[type][moduleTag];
  }
}
