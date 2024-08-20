define([], function () {
  /**
   * Abstract Class QuestionStrategy
   * @class QuestionStrategy
   */
  class QuestionStrategy {
    constructor(experience) {
      this.experience = experience;
    }

    modifySearchOptions(options, comp) {
      throw new Error("This method should be overridden!");
    }

    displayAnswerOptions() {
      throw new Error("This method should be overriden!");
    }
  }

  return QuestionStrategy;
});
