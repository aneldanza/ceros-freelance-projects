define([], function () {
  class Observer {
    constructor() {
      this.observers = [];
    }
    addObserver(observerFn) {
      if (typeof observerFn === "function") {
        this.observers.push(observerFn);
      }
    }
    removeObserver(observerFn) {
      this.observers = this.observers.filter((fn) => fn !== observerFn);
    }
    notify(data) {
      this.observers.forEach((fn) => fn(data));
    }
  }

  return Observer;
});
