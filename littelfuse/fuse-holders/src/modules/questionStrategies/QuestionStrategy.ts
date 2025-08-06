import { Node } from "../Node";

export abstract class QuestionStrategy {
  constructor(public name: string, public experience: Experience) {}

  abstract displayAnswerOptions(node: Node): void;

  abstract reset(): void;
}
