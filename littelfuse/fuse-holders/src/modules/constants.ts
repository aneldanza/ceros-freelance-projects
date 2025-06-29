import { FieldNodes } from "./quizTypes";

export const fieldNodesDict: FieldNodes = {
  "fuse type": {
    type: "question",
    pathText: "Fuse Type: {{}}",
  },
  "fuse style": {
    type: "question",
    pathText: "Fuse Style: {{}}",
    questionStrategy: "masking-with-subcategories",
  },
  "max voltage": {
    type: "question",
    pathText: "Volts: {{}}V DC",
    questionStrategy: "hiding",
  },
  "max current": {
    type: "question",
    pathText: "Amps: {{}}A",
    questionStrategy: "hiding",
  },
  "circuit option": {
    type: "question",
    pathText: "Circuit Option: {{}}",
    questionStrategy: "masking",
  },
  style: {
    type: "question",
    pathText: "Style: {{}}",
    questionStrategy: "masking",
    skipif: ["PCBA", "Fuse Block / PDM"],
  },
  "mounting method": {
    type: "question",
    pathText: "Mounting: {{}}",
    questionStrategy: "masking-with-subcategories",
    skipBackIf: { style: ["PCBA", "Fuse Block / PDM"] },
  },
  protection: {
    type: "question",
    pathText: "Protection: {{}}",
    questionStrategy: "masking",
  },
  part: {
    type: "result",
    pathText: "",
  },
};

// export const fields = [
//   "Fuse Type",
//   "Fuse Style",
//   "Max Voltage",
//   "Max Current",
//   "Circuit Option",
//   "Style",
//   "Mounting Method",
//   "Protection",
//   "part",
// ];

// export const maskingStrategyQuestions = [
//   "Circuit Option",
//   "Style",
//   "Mounting Method",
//   "Protection",
// ];

// export const hidingStrategyQuestions = ["Max Voltage", "Max Current"];

// export const pathMap: Record<string, string> = {
//   "Fuse Type": "Fuse Type: {{}}",
//   "Fuse Style": "Fuse Style: {{}}",
//   "Max Voltage": "Volts: {{}}V DC",
//   "Max Current": "Amps: {{}}A",
//   "Circuit Option": "Fuse Holder Position: {{}}",
//   Style: "Fuse Holder Style: {{}}",
//   "Mounting Method": "Mounting: {{}}",
//   Protection: "Protection: {{}}",
// };

export const OPTION = "answer";
export const QUESTION = "q";
export const DELIMETER = ":";
export const SPECS = "specs";
export const SERIES = "series";
export const PART = "part";
export const DESCRIPTION = "description";
export const DATASHEET = "datasheet";
export const PRINT = "2d print";
export const PATH = "path";
export const BACK = "back";
export const NAV = "nav";
export const RELATED_PRODUCTS = "related products";
export const DIVIDER = ";";
