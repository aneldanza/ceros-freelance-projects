export type QuestionStrategyName = "hiding" | "masking";

export type FieldNodes = {
  [key: string]: {
    type: "question" | "result";
    pathText: string;
    questionStrategy?: QuestionStrategyName;
    skipif?: string[];
    skipBackIf?: Record<string, string[]>;
  };
};
