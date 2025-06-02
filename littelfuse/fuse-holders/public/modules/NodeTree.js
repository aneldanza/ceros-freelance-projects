define(["require", "exports", "./Node"], function (require, exports, Node_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeTree = void 0;
    class NodeTree {
        constructor(fields) {
            this.fields = fields;
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
            for (let i = 0; i < this.fields.length; i++) {
                const key = this.fields[i].trim();
                const val = obj[key].trim();
                if (i === this.fields.length - 1) {
                    parent = this.addNewNode(val, key, parent, obj);
                }
                else {
                    parent = this.addNewNode(val, key, parent);
                }
            }
        }
        findChild(parentNode, name, value) {
            return parentNode.children.find((node) => node.name.toLocaleLowerCase() === name.toLocaleLowerCase().trim() &&
                node.value.toLocaleLowerCase() === value.toLocaleLowerCase().trim());
        }
    }
    exports.NodeTree = NodeTree;
});
