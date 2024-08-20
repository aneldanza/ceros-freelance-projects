define([
  "modules/MaskingStrategy",
  "modules/HidingStrategy",
  "modules/ResultHandler",
], function (MaskingStrategy, HidingStrategy, ResultHandler) {
  class QuizContext {
    constructor(
      CerosSDK,
      experience,
      questionNames,
      navDict,
      distributor,
      utils,
      nodeTree,
      nodeManager,
      root
    ) {
      this.CerosSDK = CerosSDK;
      this.experience = experience;
      this.nodeManager = nodeManager;
      this.nodeTree = nodeTree;
      this.root = root;
      this.questionNames = questionNames;
      this.navDict = navDict;
      this.distributor = distributor;
      this.utils = utils;
      this.questions = {};
      this.resultHandler = new ResultHandler(
        this.experience,
        this.CerosSDK,
        this.nodeManager,
        this.distributor,
        this.utils
      );

      this.pathCollection = experience.findComponentsByTag("path");
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
        console.log(data.node);
        const name = data.node.children[0] ? data.node.children[0].name : "";

        if (name === "part") {
          this.resultHandler.showResultModule(data.node.children.length);
        } else {
          this.questions[name].displayAnswerOptions(data);
        }
      }
    }

    handleBackNavigation() {
      if (!this.utils.isDoubleClickBug()) {
        this.nodeManager.setCurrentNode(
          this.nodeManager.getCurrentNode().parent
        );
      } else {
        console.log("detected double click");
      }
    }

    updatePath(data) {
      let currentNode = data.node;
      const pathArray = [];

      while (currentNode.parent) {
        const template = this.navDict[currentNode.name];
        const value =
          currentNode.name === "polarized"
            ? this.utils.getPolarizedValue(currentNode.value.toLowerCase())
            : this.utils.capitalize(currentNode.value.split(" ").join(""));

        const text = template.replace("{{}}", value);
        pathArray.unshift(text);

        currentNode = currentNode.parent;
      }

      pathArray.length
        ? this.pathCollection.setText(pathArray.join("  >  "))
        : this.pathCollection.setText("");

      this.pathCollection.show();
    }
  }

  return QuizContext;
});
