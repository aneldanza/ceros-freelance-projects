define(["modules/MaskingStrategy", "modules/HidingStrategy"], function (
  MaskingStrategy,
  HidingStrategy
) {
  class QuizContext {
    constructor(experience, questionNames, nodeTree, nodeManager, root) {
      this.experience = experience;
      this.nodeManager = nodeManager;
      this.nodeTree = nodeTree;
      this.root = root;
      this.questionNames = questionNames;
      this.questions = {};
    }

    setStrategy(strategy, name) {
      this.questions[name] = strategy;
    }

    setStrategiesBasedOnQuestionName() {
      this.questionNames.forEach((name) => {
        let strategy;
        if (name === "coil-voltage" || name === "current-rating") {
          strategy = new HidingStrategy(this.experience);
        } else {
          strategy = new MaskingStrategy(this.experience);
        }
        this.setStrategy(strategy, name);
      });
    }

    handleQuestion(question) {
      this.strategy.handleQuestion(question);
    }

    onAnswerClick(comp) {
      const tag = comp.getTags().find((tag) => tag.includes("q:"));
      const name = tag.split(":")[1];
      const parentNode = this.nodeManager.getCurrentNode();
      const options = this.questions[name].modifySearchOptions({ name }, comp);
      //   const node = this.nodeTree.depthFirstSearch(parentNode, options);
      const node = this.nodeTree.findChildByOptions(parentNode, options);
      node
        ? this.nodeManager.setCurrentNode(node)
        : console.error(`coudn't find node with ${name} and value ${val}`);
    }

    /**
     *
     * @param { {action: string; data: Node } data
     */
    handleNodeChange(data) {
      if (data.action === "currentNodeChanged") {
        const name = data.node.children[0] ? data.node.children[0].name : "";

        if (name === "polarized") {
          this.showResultModule(data.node.children.length);
        } else {
          this.questions[name].displayAnswerOptions(data);
        }
      }
    }

    showResultModule(type) {
      updateModuleResults(type);

      const moduleResultHotspot = experience.findComponentsByTag(
        `module-${type}`
      );
      moduleResultHotspot.click();
    }
  }

  return QuizContext;
});
