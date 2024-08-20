define(["modules/MaskingStrategy", "modules/HidingStrategy"], function (
  MaskingStrategy,
  HidingStrategy
) {
  class QuizContext {
    constructor(questionNames, nodeTree, nodeManager, root) {
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
          strategy = new HidingStrategy();
        } else {
          strategy = new MaskingStrategy();
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
  }

  return QuizContext;
});
