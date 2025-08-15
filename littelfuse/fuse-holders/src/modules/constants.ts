import { FieldNodes } from "./quizTypes";

export const transitionFields: { [key: string]: string } = {
  "fuse type": "fuse type-path2",
  "fuse style": "fuse style-path2",
  "max voltage": "max voltage-path2",
  "max current": "max current-path2",
};

export const path2Fields: string[] = [
  "fuse type",
  "application voltage",
  "application load",
  "application amps",
  "fuse style-path2",
];

export const path1Fields: string[] = [
  "fuse type",
  "fuse style",
  "max voltage",
  "max current",
  "circuit option",
  "style",
  "mounting method",
  "protection",
  "part",
];

export const fieldNodesDict: FieldNodes = {
  "application voltage": {
    type: "question",
    pathText: "Voltage: {{}}",
  },
  "application load": {
    type: "question",
    pathText: "Load: {{}}",
    questionStrategy: "masking",
    multiValue: true,
  },
  "application amps": {
    type: "question",
    pathText: "Amps: {{}}",
    questionStrategy: "slider",
  },
  "fuse style-path2": {
    type: "question",
    pathText: "Style: {{}}",
    questionStrategy: "segments",
  },
  "max voltage-path2": {
    type: "question",
    pathText: "Volts: <={{}}V DC",
    breakKeys: true,
  },
  "max current-path2": {
    type: "question",
    pathText: "Amps: {{}}A",
    breakKeys: true,
  },
  "fuse type": {
    type: "question",
    pathText: "Fuse Type: {{}}",
  },
  "fuse type-path2": {
    type: "question",
    pathText: "{{}}",
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
    pathText: "Circuit: {{}}",
    questionStrategy: "masking",
  },
  style: {
    type: "question",
    pathText: "Style: {{}}",
    questionStrategy: "masking",
    skipif: ["PCBA", "Fuse Block"],
  },
  "mounting method": {
    type: "question",
    pathText: "Mounting: {{}}",
    questionStrategy: "masking-with-subcategories",
    skipBackIf: { style: ["PCBA", "Fuse Block"] },
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

export const OPTION = "answer";
export const QUESTION = "q";
export const RESET = "reset";
export const DELIMETER = ":";
export const SPECS = "specs";
export const SERIES = "series";
export const PART = "part";
export const IMAGE = "img";
export const DESCRIPTION = "description";
export const DATASHEET = "datasheet";
export const PRINT = "2d print";
export const BUY_NOW = "buy-now";
export const PRODUCT_GUIDE = "product guide";
export const PATH = "path";
export const BACK = "back";
export const NAV = "nav";
export const RELATED_PRODUCTS = "related products";
export const ACCESSORIES = "accessories";
export const RESULTS = "module";
export const PARTS = "part module";
export const SEGMENTS = "segment";
export const DIVIDER = ";";
export const MAX_RELATED_PRODUCTS = 2;
export const MAX_ACCESSORIES = 4;
export const MAX_RESULTS = 5;
export const MCASE_ADAPTER = "mcase-adapter";
export const IMG_LRG = "img lrg";
export const PATH2 = "path2";
export const PATH1 = "path1";
export const FUSE_STYLE_INFO = "fuse style info";
export const FUSE_TYPE_INFO = "fuse type info";
export const TAB = "tab";

export const DEFAULT_IMAGE =
  "https://ceros-projects.s3.us-east-2.amazonaws.com/littlefuse/fuse-holders/Image+Not+Available.jpg";
