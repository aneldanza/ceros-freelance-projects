import { Node } from "./Node";
import { FieldNodes } from "./quizTypes";

export class NodeTree {
  public root: Node;

  constructor(public fields: FieldNodes) {
    // constructor(public fields: string[]) {
    this.root = new Node("Root");
  }

  buildTree(data: Record<string, string>[]) {
    data.forEach((obj) => {
      this.addBranch(this.root, obj);
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

  addBranch(node: Node, obj: Record<string, string>) {
    let parent = node;
    const fieldNames = Object.keys(this.fields);
    for (let i = 0; i < fieldNames.length; i++) {
      const key = fieldNames[i].trim();
      // for (let i = 0; i < this.fields.length; i++) {
      //   const key = this.fields[i].trim();
      // const val = obj[key].trim();
      const val = obj[key].trim();
      if (this.fields[fieldNames[i]].type === "result") {
        parent = this.addNewNode(val, key, parent, obj);
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
