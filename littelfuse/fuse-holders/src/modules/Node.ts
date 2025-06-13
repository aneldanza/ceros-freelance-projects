export class Node {
  public children: Node[] = [];
  public elementId: string = "";
  public data: object = {};

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
