define(["modules/QuestionStrategy"], function (QuestionStrategy) {
  class MaskingStrategy extends QuestionStrategy {
    modifySearchOptions(options, comp) {
      const val = comp.getPayload().trim();
      options.value = val;
      return options;
    }
  }

  return MaskingStrategy;
});
