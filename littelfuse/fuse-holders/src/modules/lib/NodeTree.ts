import { Node } from "./Node";
import { CsvData, FieldNodes } from "../quizTypes";
import { getChildrenByPath, makeKeys, MERGE_FIELDS_P1 } from "./treeHelpers";
import { getP1MergeValsFromP2Node } from "./treeHelpers";

export class NodeTree {
  public root: Node;

  constructor(public fields: FieldNodes) {
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

      if (this.fields[key].multiValue) {
        const remainingFields = fieldNames.slice(i + 1);
        const values = obj[key].split(",").map((val) => val.trim());

        values.forEach((value) => {
          // const node = this.addNewNode(value, key, parent);
          let newNode: Node;
          if (
            this.fields[key].type === "result" ||
            this.fields[key].questionStrategy === "segments" ||
            i === fieldNames.length - 1
          ) {
            newNode = this.addNewNode(value, key, parent, obj);
          } else {
            newNode = this.addNewNode(value, key, parent);
          }

          this.addBranch(newNode, obj, remainingFields);
        });

        return;
      }

      if (
        this.fields[key].type === "result" ||
        this.fields[key].questionStrategy === "segments" ||
        i === fieldNames.length - 1
      ) {
        parent = this.addNewNode(val, key, parent, obj);
      } else {
        parent = this.addNewNode(val, key, parent);
      }
    }
  }

  mergeNodes(
    parent: Node,
    transitionFields: { [key: string]: string },
    path1NodeTree: NodeTree
  ) {
    const vals = getP1MergeValsFromP2Node(parent, transitionFields);
    if (vals) {
      const keys = makeKeys(vals, MERGE_FIELDS_P1, this.fields);
      let combined: Node[] = [];
      keys.forEach((key) => {
        const children = getChildrenByPath(key, path1NodeTree.root);
        combined = [...combined, ...children];
      });

      this.attachNewChildren(combined, parent);
    }
  }

  attachNewChildren(children: Node[], parent: Node) {
    if (!children || children.length === 0) return;

    children.forEach((node) => {
      const newParent = this.addNewNode(
        node.value,
        node.name,
        parent,
        node.data
      );
      const children = node.children;
      this.attachNewChildren(children, newParent);
    });
  }

  mergeDataWithFields(
    path1NodeTree: NodeTree,
    path2Root: Node,
    transitionFields: { [key: string]: string }
  ) {
    const visit = (n: Node) => {
      if (n.children.length === 0) {
        this.mergeNodes(n, transitionFields, path1NodeTree);
        // No need to descend below merge depth
        return;
      }
      // keep walking until we hit the last node
      for (const c of n.children) visit(c);
    };
    // start below Root; Root itself can’t be a merge node
    for (const c of path2Root.children) visit(c);
  }

  findChild(parentNode: Node, key: "elementId" | "value", value: string) {
    return parentNode.children.find(
      (node) => node[key].toLowerCase() === value.toLowerCase().trim()
    );
  }
}
