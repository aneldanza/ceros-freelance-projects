import { Node } from "../Node";
import { Observable } from "../Observer";
import { AnswerSelection } from "../quizTypes";

export abstract class QuestionStrategy {
  protected optionsCollection: CerosComponentCollection;
  public key: "value" | "elementId" = "value";
  public selectedOption: Observable<string>;

  constructor(
    public name: string,
    public experience: Experience,
    protected CerosSDK: CerosSDK
  ) {
    this.optionsCollection = experience.findComponentsByTag(`q:${name}`);
    this.selectedOption = new Observable(`${name}:${this.key}:`);
  }

  abstract displayAnswerOptions(node: Node): void;

  abstract reset(): void;
}
