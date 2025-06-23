define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BACK = exports.PATH = exports.DESCRIPTION = exports.SPECS = exports.DELIMETER = exports.QUESTION = exports.OPTION = exports.pathMap = exports.hidingStrategyQuestions = exports.maskingStrategyQuestions = exports.fields = exports.fieldNodesDict = void 0;
    exports.fieldNodesDict = {
        "fuse type": {
            type: "question",
            pathText: "Fuse Type: {{}}",
        },
        "fuse style": {
            type: "question",
            pathText: "Fuse Style: {{}}",
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
            pathText: "Fuse Holder Position: {{}}",
            questionStrategy: "masking",
        },
        style: {
            type: "question",
            pathText: "Fuse Holder Style: {{}}",
            questionStrategy: "masking",
        },
        "mounting method": {
            type: "question",
            pathText: "Mounting: {{}}",
            questionStrategy: "masking",
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
    exports.fields = [
        "Fuse Type",
        "Fuse Style",
        "Max Voltage",
        "Max Current",
        "Circuit Option",
        "Style",
        "Mounting Method",
        "Protection",
        "part",
    ];
    exports.maskingStrategyQuestions = [
        "Circuit Option",
        "Style",
        "Mounting Method",
        "Protection",
    ];
    exports.hidingStrategyQuestions = ["Max Voltage", "Max Current"];
    exports.pathMap = {
        "Fuse Type": "Fuse Type: {{}}",
        "Fuse Style": "Fuse Style: {{}}",
        "Max Voltage": "Volts: {{}}V DC",
        "Max Current": "Amps: {{}}A",
        "Circuit Option": "Fuse Holder Position: {{}}",
        Style: "Fuse Holder Style: {{}}",
        "Mounting Method": "Mounting: {{}}",
        Protection: "Protection: {{}}",
    };
    exports.OPTION = "answer";
    exports.QUESTION = "q";
    exports.DELIMETER = ":";
    exports.SPECS = "specs";
    exports.DESCRIPTION = "description";
    exports.PATH = "path";
    exports.BACK = "back";
});
