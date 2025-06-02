import { Node } from "./Node";

export class NodeTree {
  public root: Node;

  constructor(private fields: string[]) {
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
    for (let i = 0; i < this.fields.length; i++) {
      const key = this.fields[i].trim();
      const val = obj[key].trim();
      if (i === this.fields.length - 1) {
        parent = this.addNewNode(val, key, parent, obj);
      } else {
        parent = this.addNewNode(val, key, parent);
      }
    }
  }

  findChild(parentNode: Node, name: string, value: string) {
    return parentNode.children.find(
      (node) =>
        node.name.toLocaleLowerCase() === name.toLocaleLowerCase().trim() &&
        node.value.toLocaleLowerCase() === value.toLocaleLowerCase().trim()
    );
  }
}
