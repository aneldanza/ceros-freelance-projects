import { DELIMETER, DEFAULT_IMAGE } from "./constants";

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

export const getModuleTag = (
  length: number,
  index: number,
  moduleName: string
) => {
  return length > 1
    ? `${length}-${moduleName}-${index + 1}`
    : `${length}-${moduleName}`;
};

export const setImageUrl = (imgStr: string, img: CerosLayer) => {
  try {
    new URL(imgStr);
    img.setUrl(imgStr);
  } catch (e) {
    console.error(e);
    img.setUrl(DEFAULT_IMAGE);
  }
};

export const isMobile = (experience: Experience) => {
  return experience.findComponentsByTag("mobile").components.length > 0;
};
