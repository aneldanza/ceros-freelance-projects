define(["modules/QuestionStrategy"], function (QuestionStrategy) {
  class MaskingStrategy extends QuestionStrategy {
    constructor(experience, name) {
      super(experience, name);
      this.masksCollection = this.experience.findLayersByTag(
        `mask:${this.name}`
      );
    }
    modifySearchOptions(options, comp) {
      const val = comp.getPayload().trim();
      options.value = val;
      return options;
    }

    displayAnswerOptions(data) {
      this.handleMasks(data.node);
    }

    handleMasks(node) {
      this.masksCollection.layers.forEach((layer) => {
        const val = layer.getPayload().toLowerCase();
        if (node.children.find((node) => node.value.toLowerCase() === val)) {
          layer.hide();
        } else {
          layer.show();
        }
      });
    }

    registerMaskAnimations() {}
  }

  return MaskingStrategy;
});
