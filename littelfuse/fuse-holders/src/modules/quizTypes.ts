import { RESULTS, RELATED_PRODUCTS, ACCESSORIES } from "./constants";

export type QuestionStrategyName =
  | "hiding"
  | "masking"
  | "masking-with-subcategories"
  | "masking-with-mulitiple-cell-values"
  | "slider";

export type Field = {
  type: "question" | "result";
  pathText: string;
  questionStrategy?: QuestionStrategyName;
  skipif?: string[];
  skipBackIf?: Record<string, string[]>;
};
export type FieldNodes = {
  [key: string]: Field;
};

export type CsvData = { [key: string]: string };

export type Overlay = typeof ACCESSORIES | typeof RELATED_PRODUCTS;
