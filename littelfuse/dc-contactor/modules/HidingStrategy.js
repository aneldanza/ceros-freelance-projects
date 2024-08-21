define(["modules/QuestionStrategy"], function (QuestionStrategy) {
  class HidingStrategy extends QuestionStrategy {
    modifySearchOptions(options, comp) {
      options.elementId = comp.id;
      return options;
    }

    displayAnswerOptions(data) {
      const sortedNodes = data.node.children.sort((a, b) => a.value - b.value);
      const evenOptions = this.experience.findLayersByTag(
        `${data.node.children[0].name}_even`
      );
      const oddOptions = this.experience.findLayersByTag(
        `${data.node.children[0].name}_odd`
      );

      /**
       * Check for mobile tag on mobile layout canvas
       */
      const isMobile =
        this.experience.findComponentsByTag("mobile").components.length;

      /**
       * Check for tablet tag on tablet layout canvas
       */
      const isTablet =
        this.experience.findComponentsByTag("tablet").components.length;

      if (isMobile || isTablet) {
        this.displayMobileLayoutOptions(oddOptions, evenOptions, sortedNodes);
      } else {
        if (data.node.children.length % 2 === 0) {
          oddOptions.hide();
          evenOptions.show();
          handleTextOptions(evenOptions, sortedNodes);
        } else {
          oddOptions.show();
          evenOptions.hide();
          handleTextOptions(oddOptions, sortedNodes);
        }
      }
    }

    displayMobileLayoutOptions(
      oddOptions,
      evenOptions,

      sortedNodes
    ) {
      if (sortedNodes.length % 2 === 0) {
        oddOptions.hide();
        evenOptions.show();

        this.handleMobileTextOptions(evenOptions, sortedNodes);
      } else {
        oddOptions.show();
        evenOptions.hide();

        this.handleMobileTextOptions(oddOptions, sortedNodes);
      }
    }

    handleMobileTextOptions(options, nodes) {
      const collection = options.layers[0].findAllComponents();

      let answerIndex = 0;
      if (nodes.length === 1) {
        this.handleOneOptionInMobileView(nodes, collection);
      } else {
        collection.layers.forEach((layer, i) => {
          if (layer.type === "text") {
            if (answerIndex < nodes.length) {
              layer.setText(nodes[answerIndex].value);
              nodes[answerIndex].elementId = layer.id;
            } else {
              layer.hide();
            }
            answerIndex++;
          } else if (layer.type === "line") {
            const position = !isNaN(layer.getPayload())
              ? Number(layer.getPayload())
              : null;
            if (position) {
              if (
                position >= nodes.length ||
                ((nodes.length === 4 || position.length === 5) &&
                  position > nodes.length - 2)
              ) {
                layer.hide();
              }
            } else {
              console.error(
                `there is no position number in payload of divider line with id ${layer.id} in question ${nodes[0].name}`
              );
            }
          }
        });
      }
    }

    handleOneOptionInMobileView(nodes, collection) {
      let answerIndex = 0;
      collection.layers.forEach((layer) => {
        if (layer.type === "text") {
          if (answerIndex === 1) {
            layer.setText(nodes[0].value);
            nodes[0].elementId = layer.id;
          } else {
            layer.hide();
          }
          answerIndex++;
        } else {
          layer.hide();
        }
      });
    }
  }

  return HidingStrategy;
});
