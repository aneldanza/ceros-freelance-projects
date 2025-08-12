import { Node } from "../Node";
import { NonStrictObservable } from "../Observer";

export abstract class QuestionStrategy {
  protected optionsCollection: CerosComponentCollection;
  public key: "value" | "elementId" = "value";
  public selectedOption: NonStrictObservable<string>;

  constructor(
    public name: string,
    public experience: Experience,
    protected CerosSDK: CerosSDK
  ) {
    this.optionsCollection = experience.findComponentsByTag(`q:${name}`);
    this.selectedOption = new NonStrictObservable(`${name}:${this.key}:`);
  }

  abstract displayAnswerOptions(node: Node): void;
}
