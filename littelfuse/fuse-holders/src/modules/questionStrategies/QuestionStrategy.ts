import { PATH2 } from "../constants";
import { Node } from "../lib/Node";
import { NonStrictObservable } from "../Observer";

export abstract class QuestionStrategy {
  protected optionsCollection: CerosComponentCollection;
  public pathNavigationCollection: CerosLayerCollection;
  public key: "value" | "elementId" = "value";
  public selectedOption: NonStrictObservable<string>;

  constructor(
    public name: string,
    public experience: Experience,
    protected CerosSDK: CerosSDK
  ) {
    this.optionsCollection = experience.findComponentsByTag(`q:${name}`);
    this.pathNavigationCollection = experience.findLayersByTag(`nav:${name}`);
    this.selectedOption = new NonStrictObservable(`${name}:${this.key}:`);
  }

  abstract displayAnswerOptions(node: Node): void;

  displayPathNavigation(pathName: string) {
    if (pathName === PATH2) {
      const path2NavCollection =
        this.experience.findComponentsByTag("show-path2-nav");
      path2NavCollection.click();
    } else {
      const path1NavCollection =
        this.experience.findComponentsByTag("show-path1-nav");
      path1NavCollection.click();
    }
  }
}
