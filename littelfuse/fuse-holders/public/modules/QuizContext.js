define(["require", "exports", "./constants", "./Observer", "./utils", "./questionStrategies/HidingOptionsStrategy", "./questionStrategies/MaskingOptionsStrategy", "./ResultHandler", "./DoubleClickBugHandler"], function (require, exports, constants_1, Observer_1, utils_1, HidingOptionsStrategy_1, MaskingOptionsStrategy_1, ResultHandler_1, DoubleClickBugHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuizContext = void 0;
    class QuizContext {
        constructor(CerosSDK, experience, nodeTree, distributor) {
            this.CerosSDK = CerosSDK;
            this.experience = experience;
            this.nodeTree = nodeTree;
            this.questions = {};
            this.currentNode = new Observer_1.Observable(this.nodeTree.root);
            this.answerCollection = this.experience.findComponentsByTag(constants_1.OPTION);
            this.pathTextCollection = this.experience.findComponentsByTag(constants_1.PATH);
            this.resultHandler = new ResultHandler_1.ResultHandler(experience, CerosSDK, this.currentNode, distributor);
            this.doubleClickHandler = new DoubleClickBugHandler_1.DoubleClickBugHandler();
            this.init();
        }
        init() {
            this.subscribeCurrentNodeObserver();
            this.subscribeToCerosEvents();
            this.assignQuestionsStrategy();
        }
        subscribeCurrentNodeObserver() {
            this.currentNode.subscribe(this.handleNodeChange.bind(this));
            this.currentNode.subscribe(this.updatePath.bind(this));
        }
        assignQuestionsStrategy() {
            constants_1.hidingStrategyQuestions.forEach((fieldName) => {
                const name = fieldName.toLowerCase();
                const strategy = new HidingOptionsStrategy_1.HidingOptionsStrategy(name, this.experience);
                this.questions[name] = strategy;
            });
            constants_1.maskingStrategyQuestions.forEach((fieldName) => {
                const name = fieldName.toLowerCase();
                const strategy = new MaskingOptionsStrategy_1.MaskingOptionsStrategy(name, this.experience, this.currentNode, this.CerosSDK);
                this.questions[name] = strategy;
            });
        }
        subscribeToCerosEvents() {
            this.answerCollection.on(this.CerosSDK.EVENTS.CLICKED, this.handleAnswerClick.bind(this));
        }
        handleAnswerClick(comp) {
            if (!this.doubleClickHandler.isDoubleClickBug(comp.id)) {
                const qName = (0, utils_1.getValueFromTags)(comp.getTags(), constants_1.QUESTION);
                const question = this.questions[qName];
                const { key, value } = question instanceof HidingOptionsStrategy_1.HidingOptionsStrategy
                    ? { key: "elementId", value: comp.id }
                    : { key: "value", value: comp.getPayload() };
                const node = this.nodeTree.findChild(this.currentNode.value, key, value);
                if (node) {
                    this.currentNode.value = node;
                }
                else {
                    console.error(`coudn't find node with ${qName} and value ${value}`);
                }
            }
        }
        handleNodeChange(node) {
            if (node.children) {
                if (this.isLastQuestion(node)) {
                    console.log("show results!");
                    this.resultHandler.showResultModule(node.children.length);
                }
                else {
                    console.log("display next question answer options");
                    console.log(this.currentNode.value);
                    const childNodeName = node.children[0].name.toLowerCase();
                    this.questions[childNodeName] &&
                        this.questions[childNodeName].displayAnswerOptions(node);
                }
            }
        }
        updatePath(node) {
            let currentNode = node;
            const pathArray = [];
            const nodePath = currentNode.getPath();
            nodePath.forEach(({ name, value }) => {
                if (name === "Root") {
                    return;
                }
                const template = constants_1.pathMap[name];
                const formattedValue = (0, utils_1.capitalize)(value.split(" ").join(""));
                const text = template.replace("{{}}", formattedValue);
                pathArray.push(text);
            });
            pathArray.length
                ? this.pathTextCollection.setText(pathArray.join("  >  "))
                : this.pathTextCollection.setText("");
            this.pathTextCollection.show();
        }
        isLastQuestion(node) {
            const childNode = node.children[0];
            return Object.keys(childNode.data).length;
        }
    }
    exports.QuizContext = QuizContext;
});
