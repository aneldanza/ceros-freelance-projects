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
        buildTree(data, fieldNames) {
            data.forEach((obj) => {
                this.addBranch(this.root, obj, fieldNames);
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
        addBranch(node, obj, fieldNames) {
            var _a, _b;
            let parent = node;
            for (let i = 0; i < fieldNames.length; i++) {
                const key = fieldNames[i].trim();
                const val = (_b = (_a = obj[key]) === null || _a === void 0 ? void 0 : _a.trim) === null || _b === void 0 ? void 0 : _b.call(_a);
                if (!val)
                    continue;
                if (this.fields[key].type === "result") {
                    parent = this.addNewNode(val, key, parent, obj);
                }
                else if (this.fields[key].multiValue) {
                    const remainingFields = fieldNames.slice(i + 1);
                    const values = obj[key].split(",").map((val) => val.trim());
                    values.forEach((value) => {
                        const node = this.addNewNode(value, key, parent);
                        this.addBranch(node, obj, remainingFields);
                    });
                    return;
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
