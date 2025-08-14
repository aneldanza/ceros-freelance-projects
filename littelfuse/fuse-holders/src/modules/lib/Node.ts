import { CsvData } from "../quizTypes";

export class Node {
  public children: Node[] = [];
  public elementId: string = "";
  public data: CsvData = {};
  public portal?: { __portal: boolean; __target: Node; portalNode: Node };

  constructor(
    public name: string,
    public value: string = "",
    public parent: Node | null = null
  ) {}

  findChildByValueProperty(value: string) {
    return (
      this.children.find(
        (child) => child.value.toLowerCase() === value.toLowerCase()
      ) || null
    );
  }

  findChildThatIncludesValue(value: string) {
    return (
      this.children.find(
        (child) => child.value.toLowerCase() === value.toLowerCase()
      ) || null
    );
  }

  findAllChildrenThatIncludeValue(value: string) {
    return (
      this.children.filter(
        (child) => child.value.toLowerCase() === value.toLowerCase()
      ) || null
    );
  }

  findParentByName(name: string) {
    let node: Node | null = this;

    while (node) {
      if (node.name === name) {
        return node;
      }
      node = node.parent;
    }
  }

  getPath() {
    const path = [];
    let currentNode: Node | null = this;

    while (currentNode) {
      path.unshift({ name: currentNode.name, value: currentNode.value });
      currentNode = currentNode.parent;
    }

    return path;
  }
}
