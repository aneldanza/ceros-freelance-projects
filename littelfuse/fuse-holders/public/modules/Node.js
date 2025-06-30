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
            this.data = {};
        }
        findChildByValueProperty(value) {
            return (this.children.find((child) => child.value.toLowerCase() === value.toLowerCase()) || null);
        }
        findParentByName(name) {
            let node = this;
            while (node) {
                if (node.name === name) {
                    return node;
                }
                node = node.parent;
            }
        }
        getPath() {
            const path = [];
            let currentNode = this;
            while (currentNode) {
                path.unshift({ name: currentNode.name, value: currentNode.value });
                currentNode = currentNode.parent;
            }
            return path;
        }
    }
    exports.Node = Node;
});
