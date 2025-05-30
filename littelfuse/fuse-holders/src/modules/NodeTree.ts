export class NodeTree {
  constructor(private fields: string[]) {}

  buildTree(data: unknown[], fields: string[]) {
    data.forEach((obj) => {
      console.log(obj);
    });
  }
}
