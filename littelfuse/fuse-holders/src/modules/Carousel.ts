import { ModuleHandler } from "./ModuleHandler";
import { Observable } from "./Observer";
import { CsvData, Overlay } from "./quizTypes";
import { DoubleClickBugHandler } from "./DoubleClickBugHandler";

export class Carousel {
  private currentPage: Observable<number> = new Observable(0);
  private parts: CsvData[] = [];
  private next: CerosLayerCollection = this.experience.findLayersByTag(
    `${this.name}-next`
  );
  private back: CerosLayerCollection = this.experience.findLayersByTag(
    `${this.name}-back`
  );

  private currentIndex: CerosComponentCollection =
    this.experience.findComponentsByTag(`${this.name}-current`);

  private totalIndex: CerosComponentCollection =
    this.experience.findComponentsByTag(`${this.name}-total`);

  private pages: Record<number, CsvData[]> = {};

  private doubleClickBugHandler: DoubleClickBugHandler =
    new DoubleClickBugHandler();

  constructor(
    private max: number,
    private name: Overlay,
    private CerosSDK: CerosSDK,
    private experience: Experience,
    private moduleHandler: ModuleHandler
  ) {
    this.registerNavigationEvents();
  }

  init(parts: CsvData[]) {
    this.pages = {};
    this.parts = parts;
    this.paginate();
    this.setTotalPageIndex();
    this.currentPage.value = 1;
  }

  paginate() {
    let i = 0;
    let pageNum = 1;
    while (i < this.parts.length) {
      const end =
        i + this.max < this.parts.length ? i + this.max : this.parts.length;

      this.pages[pageNum] = this.parts.slice(i, end);

      i = i + this.max;
      pageNum++;
    }
    console.log(this.pages);
  }

  registerNavigationEvents() {
    this.next.on(this.CerosSDK.EVENTS.CLICKED, (layer: CerosLayer) => {
      if (this.doubleClickBugHandler.isDoubleClickBug(layer.id)) return;
      this.currentPage.value++;
      console.log(this.currentPage.value);
    });

    this.back.on(this.CerosSDK.EVENTS.CLICKED, (layer: CerosLayer) => {
      if (this.doubleClickBugHandler.isDoubleClickBug(layer.id)) return;
      this.currentPage.value--;
    });

    this.next.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, () => {
      if (this.isLastPage()) {
        this.next.hide();
      }
    });

    this.back.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, () => {
      if (this.isFirstPage()) {
        this.back.hide();
      }
    });

    this.currentPage.subscribe(() => {
      this.hideModules();
      this.updatePageIndex();
      this.populate();

      if (this.isLastPage()) {
        this.next.hide();
      } else {
        this.next.show();
      }

      if (this.isFirstPage()) {
        this.back.hide();
      } else {
        this.back.show();
      }
    });
  }

  populate() {
    let i = 0;
    const parts = this.pages[this.currentPage.value];
    while (i < this.max && i < parts.length) {
      const part = parts[i];
      if (part) {
        this.moduleHandler.updateModule(this.max, i, part);
      }
      i++;
    }
  }

  hideModules() {
    let i = 0;
    while (i < this.max) {
      this.moduleHandler.hideModule(this.max, i);

      i++;
    }
  }

  updatePageIndex() {
    this.currentIndex.components.forEach((comp) =>
      comp.setText(this.currentPage.value.toString())
    );
  }

  setTotalPageIndex() {
    const pageNums = Object.keys(this.pages);
    this.totalIndex.components.forEach((comp) =>
      comp.setText(pageNums[pageNums.length - 1])
    );
  }

  isLastPage() {
    const pageNums = Object.keys(this.pages);
    return this.currentPage.value === Number(pageNums[pageNums.length - 1]);
  }

  isFirstPage() {
    return this.currentPage.value === 1;
  }
}
