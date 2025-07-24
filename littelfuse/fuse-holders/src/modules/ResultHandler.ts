import {
  ACCESSORIES,
  DIVIDER,
  MAX_ACCESSORIES,
  MAX_RELATED_PRODUCTS,
  PRODUCT_GUIDE,
  RELATED_PRODUCTS,
  IMG_LRG,
  RESULTS,
  MAX_RESULTS,
} from "./constants";
import { Node } from "./Node";
import { Observable } from "./Observer";
import { LandingPageProxy } from "./LandinPageProxy";
import { CsvData, Overlay } from "./quizTypes";
import { ModuleHandler } from "./ModuleHandler";
import { DoubleClickBugHandler } from "./DoubleClickBugHandler";
import { Carousel } from "./Carousel";

export class ResultHandler {
  public landingPageProxy: LandingPageProxy;

  public csvData: Record<Overlay, Record<string, CsvData>> = {
    "related products": {},
    accessories: {},
  };

  private resultModulesHandler: ModuleHandler;
  private relatedProductsModulesHandler: ModuleHandler;
  private accessoriesModulesHandler: ModuleHandler;
  private resultsCarousel: Carousel;
  private accessoriesCarousel: Carousel;
  private relatedProductsCarousel: Carousel;
  private doubleClickBugHandler: DoubleClickBugHandler =
    new DoubleClickBugHandler();

  constructor(
    private experience: Experience,
    private CerosSDK: CerosSDK,
    private currentNodeObservable: Observable<Node>,
    private distributor: string,
    private relatedProductsLink: string,
    private accessoriesLink: string,
    private PapaParse: typeof window.Papa,
    private imgLrgLink: Observable<string>
  ) {
    this.landingPageProxy = new LandingPageProxy();
    this.resultModulesHandler = new ModuleHandler(
      RESULTS,
      experience,
      CerosSDK,
      distributor,
      this.landingPageProxy,
      this.imgLrgLink
    );

    this.relatedProductsModulesHandler = new ModuleHandler(
      RELATED_PRODUCTS,
      experience,
      CerosSDK,
      distributor,
      this.landingPageProxy,
      this.imgLrgLink
    );

    this.accessoriesModulesHandler = new ModuleHandler(
      ACCESSORIES,
      experience,
      CerosSDK,
      distributor,
      this.landingPageProxy,
      this.imgLrgLink
    );

    this.accessoriesCarousel = new Carousel(
      MAX_ACCESSORIES,
      ACCESSORIES,
      CerosSDK,
      experience,
      this.accessoriesModulesHandler
    );

    this.relatedProductsCarousel = new Carousel(
      MAX_RELATED_PRODUCTS,
      RELATED_PRODUCTS,
      CerosSDK,
      experience,
      this.relatedProductsModulesHandler
    );

    this.resultsCarousel = new Carousel(
      MAX_RESULTS,
      RESULTS,
      CerosSDK,
      experience,
      this.resultModulesHandler
    );
  }

  showResultModule(length: number) {
    this.updateResultModules(length);

    this.triggerHotspot(RESULTS, length, MAX_RESULTS);
  }

  sortNodesBySales() {
    return this.currentNodeObservable.value.children.sort((a, b) => {
      const aSales = isNaN(Number(a.data.sales)) ? 0 : Number(a.data.sales);
      const bSales = isNaN(Number(b.data.sales)) ? 0 : Number(b.data.sales);
      return bSales - aSales;
    });
  }

  updateResultModules(type: number) {
    const results = this.sortNodesBySales();
    if (results.length <= MAX_RESULTS) {
      results.forEach((node, index) => {
        this.resultModulesHandler.updateModule(
          type,
          index,
          node.data,
          this.processOverlayLayers.bind(this)
        );
      });
    } else {
      this.resultsCarousel.init(results.map((node) => node.data));
    }
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
    if (parts.length <= MAX_RELATED_PRODUCTS) {
      parts.forEach((part, index) => {
        this.relatedProductsModulesHandler.updateModule(
          parts.length,
          index,
          part
        );
      });
    } else {
      this.relatedProductsCarousel.init(parts);
    }
  }

  updateAccessoriesModules(parts: CsvData[]) {
    if (parts.length <= MAX_ACCESSORIES) {
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

  registerOverlayAnimation(
    layer: CerosLayer,
    moduleTag: string,
    name: Overlay
  ) {
    layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
      const items = this.getPartNumbers(moduleTag, name);
      if (items.length === 0) {
        layer.hide();
      } else if (name === ACCESSORIES) {
        const hasRelatedProducts = !!this.getPartNumbers(
          moduleTag,
          RELATED_PRODUCTS
        ).length;

        const hasProductGuide = !!this.getValue(moduleTag, PRODUCT_GUIDE);

        if (hasRelatedProducts || hasProductGuide) {
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
    overlayName: Overlay,
    link: string
  ) {
    layer.on(this.CerosSDK.EVENTS.CLICKED, async (layer) => {
      if (this.doubleClickBugHandler.isDoubleClickBug(layer.id)) return;

      const partNumbers = this.getPartNumbers(moduleTag, overlayName);

      if (!partNumbers.length) return;

      await this.loadCsvData(overlayName, link);

      const parts = this.getExistingParts(overlayName, partNumbers);

      if (!parts.length) return;

      if (overlayName === RELATED_PRODUCTS) {
        this.updateRelatedProductsModules(parts);
        this.triggerHotspot(overlayName, parts.length, MAX_RELATED_PRODUCTS);
      } else if (overlayName === ACCESSORIES) {
        this.updateAccessoriesModules(parts);
        this.triggerHotspot(overlayName, parts.length, MAX_ACCESSORIES);
      }
    });
  }

  triggerHotspot(name: string, length: number, max: number) {
    const hotspotCollection = this.experience.findComponentsByTag(
      `${name}-${length <= max ? length : `${max + 1}+`}`
    );

    hotspotCollection.click();
  }

  getPartNumbers(moduleTag: string, name: string) {
    const value = this.getValue(moduleTag, name);
    return value ? value.split(DIVIDER).map((str) => str.replace(" ", "")) : [];
  }

  getValue(moduleTag: string, name: string) {
    const dict = this.resultModulesHandler.getResultData(moduleTag);
    return dict.data[name];
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
      result[obj.part.trim()] = obj;
    });
    return result;
  }
}
