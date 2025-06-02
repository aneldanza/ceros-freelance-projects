define(["require", "exports", "./constants", "./Observer", "./utils"], function (require, exports, constants_1, Observer_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuizContext = void 0;
    class QuizContext {
        constructor(CerosSDK, experience, nodeTree) {
            this.CerosSDK = CerosSDK;
            this.experience = experience;
            this.nodeTree = nodeTree;
            this.currentNode = new Observer_1.Observable(this.nodeTree.root);
            this.answerCollection = this.experience.findComponentsByTag(constants_1.OPTION);
            this.init();
        }
        init() {
            this.subscribeCurrentNodeObserver();
            this.subscribeToCerosEvents();
        }
        subscribeCurrentNodeObserver() {
            this.currentNode.subscribe(this.handleNodeChange.bind(this));
        }
        subscribeToCerosEvents() {
            this.answerCollection.on(this.CerosSDK.EVENTS.CLICKED, this.handleAnswerClick.bind(this));
        }
        handleAnswerClick(comp) {
            const qName = (0, utils_1.getValueFromTags)(comp.getTags(), constants_1.QUESTION);
            const value = comp.getPayload();
            const node = this.nodeTree.findChild(this.currentNode.value, qName, value);
            if (node) {
                this.currentNode.value = node;
            }
            else {
                console.error(`coudn't find node with ${qName} and value ${value}`);
            }
        }
        handleNodeChange(node) {
            if (node.children) {
                if (this.isLastQuestion(node)) {
                    console.log("show results!");
                }
                else {
                    console.log("display next question answer options");
                    console.log(this.currentNode);
                }
            }
        }
        isLastQuestion(node) {
            const childNode = node.children[0];
            return Object.keys(childNode.data).length;
        }
    }
    exports.QuizContext = QuizContext;
});
