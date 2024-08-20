define(["modules/QuestionStrategy"], function (QuestionStrategy) {
  class MaskingStrategy extends QuestionStrategy {
    modifySearchOptions(options, comp) {
      const val = comp.getPayload().trim();
      options.value = val;
      return options;
    }

    displayAnswerOptions(data) {
      this.handleMasks(data.node);
    }

    handleMasks(node) {
      const masksCollection = this.experience.findLayersByTag(
        `mask:${node.children[0].name}`
      );
      masksCollection.layers.forEach((layer) => {
        const val = layer.getPayload().toLowerCase();
        if (node.children.find((node) => node.value.toLowerCase() === val)) {
          layer.hide();
        } else {
          layer.show();
        }
      });
    }
  }

  return MaskingStrategy;
});
