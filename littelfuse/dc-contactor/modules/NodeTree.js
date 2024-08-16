define(["modules/Node"], function (Node) {
  class NodeTree {
    constructor(keys) {
      this.keys = keys;
    }

    buildTree(data, root) {
      data.forEach((obj) => {
        const apps = obj[this.keys[0]].split("_");
        apps.forEach((app) => {
          const key = this.keys[0];
          const value = app.trim().toLowerCase();
          const node = this.addNewNode(value, key, root);
          this.addBranch(node, obj);
        });
      });
    }

    addNewNode(val, name, parent, obj = {}) {
      const foundNode = parent.children.find((node) => node.value === val);
      if (!foundNode) {
        const node = new Node(name, val, parent);
        node.data = obj;
        parent.children.push(node);
        return node;
      } else {
        return foundNode;
      }
    }

    addBranch(node, obj) {
      let parent = node;
      for (let i = 1; i < this.keys.length; i++) {
        const key = this.keys[i];
        const val = obj[key].trim();
        if (key === "part") {
          parent = this.addNewNode(val, key, parent, obj);
        } else {
          parent = this.addNewNode(val, key, parent);
        }
      }
    }

    depthFirstSearch(node, targetValue, targetName) {
      if (
        node.value.toLowerCase() === targetValue.toLowerCase() &&
        node.name.toLowerCase() === targetName.toLowerCase()
      ) {
        return node;
      }

      for (let i = 0; i < node.children.length; i++) {
        let child = node.children[i];
        let result = this.depthFirstSearch(child, targetValue, targetName);

        if (result !== null) {
          return result;
        }
      }

      return null;
    }
  }

  return NodeTree;
});
