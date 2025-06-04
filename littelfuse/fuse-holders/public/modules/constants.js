define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DELIMETER = exports.QUESTION = exports.OPTION = exports.hidingStrategyQuestions = exports.maskingStrategyQuestions = exports.fields = void 0;
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
    exports.OPTION = "answer";
    exports.QUESTION = "q";
    exports.DELIMETER = ":";
});
