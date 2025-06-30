import {
  ACCESSORIES,
  DESCRIPTION,
  DIVIDER,
  MAX_ACCESSORIES,
  MAX_RELATED_PRODUCTS,
  RELATED_PRODUCTS,
  SPECS,
} from "./constants";
import { Node } from "./Node";
import { Observable } from "./Observer";
import { LandingPageProxy } from "./LandinPageProxy";
import { CsvData, Overlay } from "./quizTypes";
import { ModuleHandler } from "./ModuleHandler";
import { DoubleClickBugHandler } from "./DoubleClickBugHandler";
import { Carousel } from "./Carousel";

export class ResultHandler {
  private landingPageProxy: LandingPageProxy;

  private csvData: Record<Overlay, Record<string, CsvData>> = {
    "related products": {},
    accessories: {},
  };

  private overlayPartsState: Record<Overlay, CsvData[]> = {
    "related products": [],
    accessories: [],
  };
  private resultModulesHandler: ModuleHandler;
  private relatedProductsModulesHandler: ModuleHandler;
  private accessoriesModulesHandler: ModuleHandler;
  private accessoriesCarousel: Carousel;
  private doubleClickBugHandler: DoubleClickBugHandler =
    new DoubleClickBugHandler();

  constructor(
    private experience: Experience,
    private CerosSDK: CerosSDK,
    private currentNodeObservable: Observable<Node>,
    private distributor: string,
    private relatedProductsLink: string,
    private accessoriesLink: string,
    private PapaParse: typeof window.Papa
  ) {
    this.landingPageProxy = new LandingPageProxy();
    this.resultModulesHandler = new ModuleHandler(
      "module",
      experience,
      CerosSDK,
      distributor,
      this.landingPageProxy
    );

    this.relatedProductsModulesHandler = new ModuleHandler(
      RELATED_PRODUCTS,
      experience,
      CerosSDK,
      distributor,
      this.landingPageProxy
    );

    this.accessoriesModulesHandler = new ModuleHandler(
      ACCESSORIES,
      experience,
      CerosSDK,
      distributor,
      this.landingPageProxy
    );

    this.accessoriesCarousel = new Carousel(
      MAX_ACCESSORIES,
      ACCESSORIES,
      CerosSDK,
      experience,
      this.accessoriesModulesHandler
    );
  }

  showResultModule(type: number) {
    this.updateResultModules(type);

    const moduleResultHotspot = this.experience.findComponentsByTag(
      `module-${type}`
    );
    moduleResultHotspot.click();
  }

  updateResultModules(type: number) {
    this.currentNodeObservable.value.children.forEach((node, index) => {
      this.resultModulesHandler.updateModule(
        type,
        index,
        node.data,
        this.processOverlayLayers.bind(this)
      );
    });
  }

  processOverlayLayers(
    layersDict: Record<string, CerosLayer[]>,
    moduleTag: string
  ) {
    if (layersDict[RELATED_PRODUCTS]) {
      this.handleOverlay(
        RELATED_PRODUCTS,
        layersDict[RELATED_PRODUCTS],
        moduleTag,
        this.relatedProductsLink
      );
    }

    layersDict[ACCESSORIES] &&
      this.handleOverlay(
        ACCESSORIES,
        layersDict[ACCESSORIES],
        moduleTag,
        this.accessoriesLink
      );
  }

  updateRelatedProductsModules(parts: CsvData[]) {
    if (parts.length < MAX_RELATED_PRODUCTS) {
      parts.forEach((part, index) => {
        this.relatedProductsModulesHandler.updateModule(
          parts.length,
          index,
          part
        );
      });
    } else {
      // this.accessoriesCarousel.init(parts);
    }
  }

  updateAccessoriesModules(parts: CsvData[]) {
    if (parts.length < MAX_ACCESSORIES) {
      parts.forEach((part, index) => {
        this.accessoriesModulesHandler.updateModule(parts.length, index, part);
      });
    } else {
      this.accessoriesCarousel.init(parts);
    }
  }

  handleOverlay(
    name: Overlay,
    layerArray: CerosLayer[],
    moduleTag: string,
    link: string
  ) {
    layerArray.forEach((layer) => {
      this.registerOverlayAnimation(layer, moduleTag, name);

      this.registerOverlayClick(layer, moduleTag, name, link);
    });
  }

  registerOverlayAnimation(layer: CerosLayer, moduleTag: string, name: string) {
    layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
      const items = this.getRelatedParts(moduleTag, name);
      if (items.length === 0) {
        layer.hide();
      } else if (name === ACCESSORIES) {
        const hasRelatedProducts = !!this.getRelatedParts(
          moduleTag,
          RELATED_PRODUCTS
        ).length;

        if (hasRelatedProducts) {
          if (layer.getTags().find((tag) => tag === "pos:1")) {
            layer.hide();
          }
        } else {
          if (layer.getTags().find((tag) => tag === "pos:2")) {
            layer.hide();
          }
        }
      }
    });
  }

  registerOverlayClick(
    layer: CerosLayer,
    moduleTag: string,
    name: Overlay,
    link: string
  ) {
    layer.on(this.CerosSDK.EVENTS.CLICKED, async (layer) => {
      if (this.doubleClickBugHandler.isDoubleClickBug(layer.id)) return;

      const items = this.getRelatedParts(moduleTag, name);

      if (!items.length) return;

      await this.loadCsvData(name, link);

      console.log(this.csvData[name]);

      const parts = this.getExistingParts(name, items);

      if (!parts.length) return;

      if (name === RELATED_PRODUCTS) {
        this.updateRelatedProductsModules(parts);
      } else if (name === ACCESSORIES) {
        this.updateAccessoriesModules(parts);
      }

      const hotspotCollection = this.experience.findComponentsByTag(
        `${name}-${parts.length < 6 ? parts.length : "4+"}`
      );

      hotspotCollection.click();
    });
  }

  getRelatedParts(moduleTag: string, name: string) {
    const dict = this.resultModulesHandler.getResultData(moduleTag);
    const value = dict.data[name];
    const items = value ? value.split(DIVIDER).map((str) => str.trim()) : [];
    return items;
  }

  getExistingParts(overlay: Overlay, names: string[]) {
    const parts: CsvData[] = [];
    names.forEach((name) => {
      if (this.csvData[overlay][name]) {
        parts.push(this.csvData[overlay][name]);
      } else {
        console.error(`could not find part: ${name} from ${overlay}!`);
      }
    });

    return parts;
  }

  loadCsvData(name: Overlay, link: string) {
    return new Promise<{
      [key: string]: Record<string, string>;
    }>((resolve, reject) => {
      if (this.csvData[name] && Object.keys(this.csvData[name]).length > 0) {
        resolve(this.csvData[name]);
      } else {
        this.PapaParse.parse(link, {
          header: true,
          download: true,
          complete: (results) => {
            const data = this.indexByPartNumber(results.data);
            this.csvData[name] = data;
            resolve(this.csvData[name]);
          },
          error: (error: any) => reject(error),
        });
      }
    });
  }

  indexByPartNumber(data: Record<string, string>[]) {
    const result: { [key: string]: Record<string, string> } = {};
    data.forEach((obj) => {
      result[obj.part] = obj;
    });
    return result;
  }
}
