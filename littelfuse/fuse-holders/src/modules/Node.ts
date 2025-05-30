export class Node {
  public children: Node[] = [];
  public elementId: string = "";

  constructor(
    public name: string,
    public value: string = "",
    public parent: Node | null = null
  ) {}
}
