define([], function () {
  class Node {
    constructor(name, value = "", parent = null) {
      this.name = name;
      this.value = value;
      this.children = [];
      this.data = {};
      this.parent = parent;
      this.elementId = "";
    }

    /**
     * Adds a child node to the current node.
     * @param {Node} child - The child node to add.
     */
    addChild(child) {
      if (child instanceof Node) {
        this.children.push(child);
        child.parent = this;
      } else {
        console.error("Child must be an instance of Node.");
      }
    }

    /**
     * Finds a child node by a property and value.
     * @param {string} key - The property to match.
     * @param {any} value - The value to match.
     * @returns {Node|null} The matching child node or null if not found.
     */
    findChildByProperty(key, value) {
      return this.children.find((child) => child[key] === value) || null;
    }

    /**
     * Gets the full path from the root to the current node.
     * @returns {{name: string, value: string }[]} An array of objects with name and value or each node representing the path.
     */
    getPath() {
      const path = [];
      let currentNode = this;

      while (currentNode) {
        path.unshift({ name: currentNode.name, value: currentNode.value });
        currentNode = currentNode.parent;
      }

      return path;
    }
  }

  return Node;
});
