import { DELIMETER } from "./constants";

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
