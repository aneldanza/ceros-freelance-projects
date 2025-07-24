import { QuestionStrategy } from "./QuestionStrategy";
import { MaskingOptionsStrategy } from "./MaskingOptionsStrategy";
import { MaskingOptionsStrategyWithMultipleCellValues } from "./MaskOptionsStrateyWithMultipleCellValues";
import { MaskingOptionsWithSubcategoriesStrategy } from "./MaskingOptionsWithSubCategoriesStrategy";
import { HidingOptionsStrategy } from "./HidingOptionsStrategy";
import { SliderOptionsStrategy } from "./SliderOptionsStrategy";
import type { Field } from "../quizTypes";

export class QuestionStrategyFactory {
  static create(
    fieldName: string,
    field: Field,
    experience: any,
    currentNode: any,
    CerosSDK: any
  ): QuestionStrategy {
    switch (field.questionStrategy) {
      case "hiding":
        return new HidingOptionsStrategy(fieldName, experience);
      case "masking-with-subcategories":
        return new MaskingOptionsWithSubcategoriesStrategy(
          fieldName,
          experience,
          currentNode,
          CerosSDK
        );
      case "masking-with-mulitiple-cell-values":
        return new MaskingOptionsStrategyWithMultipleCellValues(
          fieldName,
          experience,
          currentNode,
          CerosSDK
        );
      case "slider":
        return new SliderOptionsStrategy(fieldName, experience);
      case "masking":
      default:
        return new MaskingOptionsStrategy(
          fieldName,
          experience,
          currentNode,
          CerosSDK
        );
    }
  }
}
