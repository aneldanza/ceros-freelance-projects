define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeTree = void 0;
    class NodeTree {
        constructor(fields) {
            this.fields = fields;
        }
        buildTree(data, fields) {
            data.forEach((obj) => {
                console.log(obj);
            });
        }
    }
    exports.NodeTree = NodeTree;
});
