define([], function () {
  function Node(name, value = "", parent = null) {
    this.name = name;
    this.value = value;
    this.children = [];
    this.data = {};
    this.parent = parent;
    this.elementId = "";
  }

  return Node;
});
