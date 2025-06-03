import { DELIMETER } from "./constants";
import { NodeTree } from "./NodeTree";

import { Node } from "./Node";

export const getValueFromTags = (
  tags: string[],
  key: string,
  del: string = DELIMETER
) => {
  const foundTag = tags.find((tag) => tag.trim().startsWith(`${key}${del}`));

  if (foundTag) {
    return foundTag.split(DELIMETER)[1].trim();
  } else {
    return "";
  }
};

export const calculateMaxNumberOfEvenAndOddChildrenAtPosition = (
  fieldName: string,
  nodeTree: NodeTree
) => {
  const fieldIndex = nodeTree.fields.findIndex(
    (f) => f.trim().toLowerCase() === fieldName.trim().toLowerCase()
  );
  if (fieldIndex === -1) {
    throw new Error(`Field "${fieldName}" not found in NodeTree fields.`);
  }

  const nodesAtLevel: Node[] = [];

  // DFS traversal to collect all nodes at the target level
  function traverse(node: Node, currentLevel: number) {
    if (currentLevel === fieldIndex) {
      nodesAtLevel.push(node);
      return;
    }
    node.children.forEach((child) => traverse(child, currentLevel + 1));
  }

  traverse(nodeTree.root, -1);

  let maxEven = 0;
  let maxOdd = 0;

  nodesAtLevel.forEach((node) => {
    const count = node.children.length;
    if (count % 2 === 0) {
      maxEven = Math.max(maxEven, count);
    } else {
      maxOdd = Math.max(maxOdd, count);
    }
  });

  return { maxEven, maxOdd };
};
