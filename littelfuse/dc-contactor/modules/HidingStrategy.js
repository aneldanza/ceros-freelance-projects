define(["modules/QuestionStrategy"], function (QuestionStrategy) {
  class HidingStrategy extends QuestionStrategy {
    modifySearchOptions(options, comp) {
      options.elementId = comp.id;
      return options;
    }
  }

  return HidingStrategy;
});
