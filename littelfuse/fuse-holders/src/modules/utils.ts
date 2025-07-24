import { DELIMETER, fieldNodesDict } from "./constants";

import { FieldNodes } from "./quizTypes";

export const getValueFromTags = (
  tags: string[],
  key: string,
  del: string = DELIMETER
) => {
  const foundTag = tags.find((tag) => tag.trim().startsWith(`${key}${del}`));

  if (foundTag) {
    return foundTag.split(DELIMETER)[1].trim();
  } else {
    return "";
  }
};

export const capitalize = (text: string) => {
  if (!text) {
    return "";
  }

  const words = text
    .split(" ")
    .map((word: string) => word[0].toUpperCase() + word.slice(1));

  return words.join(" ");
};

export const stepsFromFieldNames = (
  fieldNames: string[],
  allSteps: FieldNodes
) => {
  const entries = fieldNames.map((name) => [name, allSteps[name]]);
  return Object.fromEntries(entries);
};
