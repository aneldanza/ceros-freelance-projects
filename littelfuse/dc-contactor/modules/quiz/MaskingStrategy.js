define(["modules/quiz/QuestionStrategy"], function (QuestionStrategy) {
  class MaskingStrategy extends QuestionStrategy {
    constructor(experience, name, CerosSDK, nodeManager) {
      super(experience, name);
      this.CerosSDK = CerosSDK;
      this.nodeManager = nodeManager;
      this.masksCollection = this.experience.findLayersByTag(
        `mask:${this.name}`
      );
      this.registerMaskAnimations();
    }

    modifySearchOptions(options, comp) {
      const val = comp.getPayload().trim();
      options.value = val;
      return options;
    }

    displayAnswerOptions(data) {
      this.masksCollection.layers.forEach((layer) => {
        this.handleMasks(data.node, layer);
      });
    }

    handleMasks(node, layer) {
      const foundNode = node.findChildByStringProperty(
        "value",
        layer.getPayload().trim()
      );
      if (foundNode) {
        layer.hide();
      } else {
        layer.show();
      }
    }

    registerMaskAnimations() {
      this.masksCollection.on(
        this.CerosSDK.EVENTS.ANIMATION_STARTED,
        (layer) => {
          const parentNode = this.nodeManager.getCurrentNode();
          const foundNode = parentNode.findChildByStringProperty(
            "value",
            layer.getPayload().trim()
          );
          if (foundNode) {
            layer.hide();
          }
        }
      );
    }
  }

  return MaskingStrategy;
});
