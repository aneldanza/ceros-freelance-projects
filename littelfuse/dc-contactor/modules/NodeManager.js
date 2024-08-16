define(["modules/Observer"], function (Observer) {
  class NodeManager {
    constructor() {
      this.currentNode = null;
      this.observer = new Observer();
    }
    setCurrentNode(node) {
      this.currentNode = node;
      this.observer.notify({ action: "currentNodeChanged", node });
    }
    getCurrentNode() {
      return this.currentNode;
    }
    addObserver(observerFn) {
      this.observer.addObserver(observerFn);
    }
    removeObserver(observerFn) {
      this.observer.removeObserver(observerFn);
    }
  }

  return NodeManager;
});
