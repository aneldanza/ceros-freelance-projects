define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Node = void 0;
    class Node {
        constructor(name, value = "", parent = null) {
            this.name = name;
            this.value = value;
            this.parent = parent;
            this.children = [];
            this.elementId = "";
        }
    }
    exports.Node = Node;
});
