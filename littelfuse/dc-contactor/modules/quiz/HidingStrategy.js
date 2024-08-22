define(["modules/quiz/QuestionStrategy"], function (QuestionStrategy) {
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

      const isMobile =
        this.experience.findComponentsByTag("mobile").components.length;

      const isTablet =
        this.experience.findComponentsByTag("tablet").components.length;

      if (isMobile || isTablet) {
        this.displayMobileLayoutOptions(oddOptions, evenOptions, sortedNodes);
      } else {
        this.displayDesktopLayoutOptions(oddOptions, evenOptions, sortedNodes);
      }
    }

    displayDesktopLayoutOptions(oddOptions, evenOptions, sortedNodes) {
      if (sortedNodes.length % 2 === 0) {
        oddOptions.hide();
        evenOptions.show();
        this.handleTextOptions(evenOptions, sortedNodes);
      } else {
        oddOptions.show();
        evenOptions.hide();
        this.handleTextOptions(oddOptions, sortedNodes);
      }
    }

    displayMobileLayoutOptions(oddOptions, evenOptions, sortedNodes) {
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

    handleTextOptions(options, nodes) {
      const collection = options.layers[0].findAllComponents();

      const max = collection.layersByTag.answer.length;
      const first = Math.floor((max - nodes.length) / 2);
      let answerIndex = 0;

      collection.layers.forEach((layer, i) => {
        if (layer.type === "text") {
          if (answerIndex >= first && answerIndex - first < nodes.length) {
            layer.setText(nodes[answerIndex - first].value);
            nodes[answerIndex - first].elementId = layer.id;
          } else {
            layer.hide();
          }
          answerIndex++;
        } else if (layer.type === "line") {
          const position = !isNaN(layer.getPayload())
            ? Number(layer.getPayload())
            : null;
          if (position) {
            if (!(position > first && position - first < nodes.length)) {
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
