define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IMG_LRG = exports.MCASE_ADAPTER = exports.MAX_RESULTS = exports.MAX_ACCESSORIES = exports.MAX_RELATED_PRODUCTS = exports.DIVIDER = exports.RESULTS = exports.ACCESSORIES = exports.RELATED_PRODUCTS = exports.NAV = exports.BACK = exports.PATH = exports.PRODUCT_GUIDE = exports.BUY_NOW = exports.PRINT = exports.DATASHEET = exports.DESCRIPTION = exports.IMAGE = exports.PART = exports.SERIES = exports.SPECS = exports.DELIMETER = exports.RESET = exports.QUESTION = exports.OPTION = exports.fieldNodesDict = void 0;
    exports.fieldNodesDict = {
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
    exports.OPTION = "answer";
    exports.QUESTION = "q";
    exports.RESET = "reset";
    exports.DELIMETER = ":";
    exports.SPECS = "specs";
    exports.SERIES = "series";
    exports.PART = "part";
    exports.IMAGE = "img";
    exports.DESCRIPTION = "description";
    exports.DATASHEET = "datasheet";
    exports.PRINT = "2d print";
    exports.BUY_NOW = "buy-now";
    exports.PRODUCT_GUIDE = "product guide";
    exports.PATH = "path";
    exports.BACK = "back";
    exports.NAV = "nav";
    exports.RELATED_PRODUCTS = "related products";
    exports.ACCESSORIES = "accessories";
    exports.RESULTS = "module";
    exports.DIVIDER = ";";
    exports.MAX_RELATED_PRODUCTS = 2;
    exports.MAX_ACCESSORIES = 4;
    exports.MAX_RESULTS = 5;
    exports.MCASE_ADAPTER = "mcase-adapter";
    exports.IMG_LRG = "img lrg";
});
