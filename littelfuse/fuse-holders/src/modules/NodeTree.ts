import { Node } from "./Node";
import { FieldNodes } from "./quizTypes";

export class NodeTree {
  public root: Node;

  constructor(public fields: FieldNodes) {
    // constructor(public fields: string[]) {
    this.root = new Node("Root");
  }

  buildTree(data: Record<string, string>[], fieldNames: string[]) {
    data.forEach((obj) => {
      this.addBranch(this.root, obj, fieldNames);
    });

    console.log(this.root);
  }

  addNewNode(val: string, name: string, parent: Node, obj = {}) {
    const foundNode = parent.findChildByValueProperty(val);
    if (!foundNode) {
      const node = new Node(name, val, parent);
      node.data = obj;
      parent.children.push(node);
      return node;
    } else {
      return foundNode;
    }
  }

  addBranch(node: Node, obj: Record<string, string>, fieldNames: string[]) {
    let parent = node;
    for (let i = 0; i < fieldNames.length; i++) {
      const key = fieldNames[i].trim();
      const val = obj[key]?.trim?.();
      if (!val) continue;

      if (this.fields[key].type === "result") {
        parent = this.addNewNode(val, key, parent, obj);
      } else if (this.fields[key].multiValue) {
        const remainingFields = fieldNames.slice(i + 1);
        const values = obj[key].split(",").map((val) => val.trim());

        values.forEach((value) => {
          const node = this.addNewNode(value, key, parent);

          this.addBranch(node, obj, remainingFields);
        });

        return;
      } else {
        parent = this.addNewNode(val, key, parent);
      }
    }
  }

  findChild(parentNode: Node, key: "elementId" | "value", value: string) {
    return parentNode.children.find(
      (node) => node[key].toLowerCase() === value.toLowerCase().trim()
    );
  }
}
