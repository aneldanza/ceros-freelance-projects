define(["require", "exports", "./Observer"], function (require, exports, Observer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuizContext = void 0;
    class QuizContext {
        constructor(CerosSDK, experience, nodeTree) {
            this.CerosSDK = CerosSDK;
            this.experience = experience;
            this.nodeTree = nodeTree;
            this.init();
            this.currentNode = new Observer_1.Observable(this.nodeTree.root);
        }
        init() { }
    }
    exports.QuizContext = QuizContext;
});
