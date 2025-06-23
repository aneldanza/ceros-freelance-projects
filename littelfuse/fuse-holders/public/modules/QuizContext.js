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
            this.backLayersCollection = this.experience.findLayersByTag(constants_1.BACK);
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
            for (const fieldName in constants_1.fieldNodesDict) {
                const field = constants_1.fieldNodesDict[fieldName];
                let strategy;
                if (field.type === "question") {
                    if (field.questionStrategy && field.questionStrategy === "hiding") {
                        strategy = new HidingOptionsStrategy_1.HidingOptionsStrategy(fieldName, this.experience);
                    }
                    else if (field.questionStrategy &&
                        field.questionStrategy === "masking") {
                        strategy = new MaskingOptionsStrategy_1.MaskingOptionsStrategy(fieldName, this.experience, this.currentNode, this.CerosSDK);
                    }
                    else {
                        strategy = new MaskingOptionsStrategy_1.MaskingOptionsStrategy(fieldName, this.experience, this.currentNode, this.CerosSDK);
                    }
                    this.questions[fieldName] = strategy;
                }
            }
        }
        subscribeToCerosEvents() {
            this.answerCollection.on(this.CerosSDK.EVENTS.CLICKED, this.handleAnswerClick.bind(this));
            this.backLayersCollection.on(this.CerosSDK.EVENTS.CLICKED, this.handleBackNavigation.bind(this));
        }
        handleAnswerClick(comp) {
            if (!this.doubleClickHandler.isDoubleClickBug(comp.id)) {
                const qName = (0, utils_1.getValueFromTags)(comp.getTags(), constants_1.QUESTION);
                const question = this.questions[qName];
                if (!question) {
                    console.error(`Could not find question field ${qName}`);
                    return;
                }
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
        handleBackNavigation(layer) {
            if (!this.doubleClickHandler.isDoubleClickBug(layer.id)) {
                if (this.currentNode.value.parent) {
                    this.currentNode.value = this.currentNode.value.parent;
                }
            }
        }
        handleNodeChange(node) {
            if (node.children) {
                if (this.isLastQuestion(node)) {
                    this.resultHandler.showResultModule(node.children.length);
                }
                else {
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
                const text = template.replace("{{}}", (0, utils_1.capitalize)(value));
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
