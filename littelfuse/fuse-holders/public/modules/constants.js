define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BACK = exports.PATH = exports.DESCRIPTION = exports.SPECS = exports.DELIMETER = exports.QUESTION = exports.OPTION = exports.pathMap = exports.hidingStrategyQuestions = exports.maskingStrategyQuestions = exports.fields = void 0;
    exports.fields = [
        "Fuse Type",
        "Fuse Style",
        "Fuse Holder Voltage",
        "Fuse Holder Amps",
        "Fuse Holder Position",
        "Fuse Holder Style",
        "Fuse Holder Mounting Method",
        "Environmental Protection",
        "part",
    ];
    exports.maskingStrategyQuestions = [
        "Fuse Holder Position",
        "Fuse Holder Style",
        "Fuse Holder Mounting Method",
        "Environmental Protection",
    ];
    exports.hidingStrategyQuestions = [
        "Fuse Holder Voltage",
        "Fuse Holder Amps",
    ];
    exports.pathMap = {
        "Fuse Type": "Fuse Type: {{}}",
        "Fuse Style": "Fuse Style: {{}}",
        "Fuse Holder Voltage": "Volts: {{}}V DC",
        "Fuse Holder Amps": "Amps: {{}}A",
        "Fuse Holder Position": "Fuse Holder Position: {{}}",
        "Fuse Holder Style": "Fuse Holder Style: {{}}",
        "Fuse Holder Mounting Method": "Mounting: {{}}",
        "Environmental Protection": "Protecttion: {{}}",
    };
    exports.OPTION = "answer";
    exports.QUESTION = "q";
    exports.DELIMETER = ":";
    exports.SPECS = "specs";
    exports.DESCRIPTION = "description";
    exports.PATH = "path";
    exports.BACK = "back";
});
