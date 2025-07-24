import { RESULTS, RELATED_PRODUCTS, ACCESSORIES } from "./constants";

export type QuestionStrategyName =
  | "hiding"
  | "masking"
  | "masking-with-subcategories"
  | "slider";

export type FieldNodes = {
  [key: string]: {
    type: "question" | "result";
    pathText: string;
    questionStrategy?: QuestionStrategyName;
    skipif?: string[];
    skipBackIf?: Record<string, string[]>;
  };
};

export type CsvData = { [key: string]: string };

export type Overlay = typeof ACCESSORIES | typeof RELATED_PRODUCTS;
