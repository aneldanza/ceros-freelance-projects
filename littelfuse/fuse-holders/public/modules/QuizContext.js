/// <reference path="../../types/papaparse.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./constants", "./Observer", "./utils", "./questionStrategies/HidingOptionsStrategy", "./questionStrategies/MaskingOptionsStrategy", "./ResultHandler", "./DoubleClickBugHandler", "./questionStrategies/MaskingOptionsWithSubCategoriesStrategy", "./ModuleHandler"], function (require, exports, constants_1, Observer_1, utils_1, HidingOptionsStrategy_1, MaskingOptionsStrategy_1, ResultHandler_1, DoubleClickBugHandler_1, MaskingOptionsWithSubCategoriesStrategy_1, ModuleHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuizContext = void 0;
    class QuizContext {
        constructor(CerosSDK, experience, nodeTree, distributor, relatedProductsLink, accessoriesLink, PapaParse) {
            this.CerosSDK = CerosSDK;
            this.experience = experience;
            this.nodeTree = nodeTree;
            this.distributor = distributor;
            this.relatedProductsLink = relatedProductsLink;
            this.accessoriesLink = accessoriesLink;
            this.PapaParse = PapaParse;
            this.questions = {};
            this.currentNode = new Observer_1.Observable(this.nodeTree.root);
            this.answerCollection = this.experience.findComponentsByTag(constants_1.OPTION);
            this.backLayersCollection = this.experience.findLayersByTag(constants_1.BACK);
            this.navCollecttion = this.experience.findComponentsByTag(constants_1.NAV);
            this.pathTextCollection = this.experience.findComponentsByTag(constants_1.PATH);
            this.resetCollection = this.experience.findLayersByTag(constants_1.RESET);
            this.mcaseAdapterCtaCollection = this.experience.findLayersByTag(`${constants_1.MCASE_ADAPTER}-cta`);
            this.resultHandler = new ResultHandler_1.ResultHandler(experience, CerosSDK, this.currentNode, distributor, relatedProductsLink, accessoriesLink, PapaParse);
            this.mcaseAdapterModuleHandler = new ModuleHandler_1.ModuleHandler(constants_1.MCASE_ADAPTER, experience, CerosSDK, distributor, this.resultHandler.landingPageProxy);
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
                    if (field.questionStrategy === "hiding") {
                        strategy = new HidingOptionsStrategy_1.HidingOptionsStrategy(fieldName, this.experience);
                    }
                    else if (field.questionStrategy === "masking-with-subcategories") {
                        strategy = new MaskingOptionsWithSubCategoriesStrategy_1.MaskingOptionsWithSubcategoriesStrategy(fieldName, this.experience, this.currentNode, this.CerosSDK);
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
            this.navCollecttion.on(this.CerosSDK.EVENTS.CLICKED, this.handleRandomNavigation.bind(this));
            this.resetCollection.on(this.CerosSDK.EVENTS.CLICKED, this.resetQuiz.bind(this));
            this.mcaseAdapterCtaCollection.on(this.CerosSDK.EVENTS.CLICKED, this.handleMcaseAdapter.bind(this));
        }
        handleMcaseAdapter(layer) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.doubleClickHandler.isDoubleClickBug(layer.id))
                    return;
                const partNum = layer.getPayload().trim();
                yield this.resultHandler.loadCsvData(constants_1.RELATED_PRODUCTS, this.relatedProductsLink);
                const data = this.resultHandler.csvData[constants_1.RELATED_PRODUCTS][partNum];
                if (data) {
                    this.mcaseAdapterModuleHandler.updateModule(1, 0, data);
                    const hotspotCollection = this.experience.findComponentsByTag(`${constants_1.MCASE_ADAPTER}-1`);
                    hotspotCollection.click();
                }
                else {
                    console.error(`Could not find part ${partNum} in related products sheet`);
                }
            });
        }
        resetQuiz() {
            this.currentNode.value = this.nodeTree.root;
        }
        handleAnswerClick(comp) {
            if (this.doubleClickHandler.isDoubleClickBug(comp.id))
                return;
            const qName = (0, utils_1.getValueFromTags)(comp.getTags(), constants_1.QUESTION);
            const question = this.questions[qName];
            const answer = comp.getPayload().trim();
            if (!question) {
                console.error(`Could not find question field ${qName}`);
                return;
            }
            const { key, value } = question instanceof HidingOptionsStrategy_1.HidingOptionsStrategy
                ? { key: "elementId", value: comp.id }
                : { key: "value", value: answer };
            const node = this.nodeTree.findChild(this.currentNode.value, key, value);
            if (node) {
                if (constants_1.fieldNodesDict[qName].skipif &&
                    constants_1.fieldNodesDict[qName].skipif.find((str) => str === answer)) {
                    const nextNode = node.children[0];
                    this.currentNode.value = nextNode;
                }
                else {
                    this.currentNode.value = node;
                }
            }
            else {
                console.error(`coudn't find node with ${qName} and value ${value}`);
            }
        }
        handleBackNavigation(layer) {
            // Prevent double-click bug
            if (this.doubleClickHandler.isDoubleClickBug(layer.id))
                return;
            const current = this.currentNode.value;
            const parent = current.parent;
            if (!parent)
                return;
            const name = current.name;
            const field = constants_1.fieldNodesDict[name];
            // Check if skipBackIf logic applies
            if (field && field.skipBackIf) {
                const skipData = field.skipBackIf;
                const nodeName = Object.keys(skipData)[0];
                const valueArray = skipData[nodeName];
                const ancestor = current.findParentByName(nodeName);
                if (ancestor && valueArray.find((val) => val === ancestor.value)) {
                    // Skip one extra level if condition matches
                    this.currentNode.value = parent.parent || parent;
                    return;
                }
            }
            // Default: go back one level
            this.currentNode.value = parent;
        }
        handleRandomNavigation(comp) {
            const name = comp.getPayload().toLowerCase();
            const node = this.currentNode.value.findParentByName(name);
            if (node && node.parent) {
                this.currentNode.value = node.parent;
            }
            else {
                console.error(`Could not find node ${name} or it's parent`);
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
                const template = constants_1.fieldNodesDict[name].pathText;
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
