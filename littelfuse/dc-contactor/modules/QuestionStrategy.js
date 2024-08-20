define([], function () {
  /**
   * Abstract Class QuestionStrategy
   * @class QuestionStrategy
   */
  class QuestionStrategy {
    constructor(nodeTree) {
      this.nodeTree = nodeTree;
    }

    modifySearchOptions(options, comp) {
      throw new Error("This method should be overridden!");
    }
  }

  return QuestionStrategy;
});
