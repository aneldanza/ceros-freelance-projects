define(["require", "exports", "./Node"], function (require, exports, Node_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeTree = void 0;
    class NodeTree {
        constructor(fields) {
            this.fields = fields;
            // constructor(public fields: string[]) {
            this.root = new Node_1.Node("Root");
        }
        buildTree(data) {
            data.forEach((obj) => {
                this.addBranch(this.root, obj);
            });
            console.log(this.root);
        }
        addNewNode(val, name, parent, obj = {}) {
            const foundNode = parent.findChildByValueProperty(val);
            if (!foundNode) {
                const node = new Node_1.Node(name, val, parent);
                node.data = obj;
                parent.children.push(node);
                return node;
            }
            else {
                return foundNode;
            }
        }
        addBranch(node, obj) {
            let parent = node;
            const fieldNames = Object.keys(this.fields);
            for (let i = 0; i < fieldNames.length; i++) {
                const key = fieldNames[i].trim();
                // for (let i = 0; i < this.fields.length; i++) {
                //   const key = this.fields[i].trim();
                // const val = obj[key].trim();
                const val = obj[key].trim().toLowerCase();
                if (this.fields[fieldNames[i]].type === "result") {
                    parent = this.addNewNode(val, key, parent, obj);
                }
                else {
                    parent = this.addNewNode(val, key, parent);
                }
            }
        }
        findChild(parentNode, key, value) {
            return parentNode.children.find((node) => node[key].toLowerCase() === value.toLowerCase().trim());
        }
    }
    exports.NodeTree = NodeTree;
});
