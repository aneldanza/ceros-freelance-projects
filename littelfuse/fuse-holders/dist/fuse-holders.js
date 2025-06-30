define('modules/constants',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MAX_ACCESSORIES = exports.MAX_RELATED_PRODUCTS = exports.DIVIDER = exports.ACCESSORIES = exports.RELATED_PRODUCTS = exports.NAV = exports.BACK = exports.PATH = exports.PRODUCT_GUIDE = exports.BUY_NOW = exports.PRINT = exports.DATASHEET = exports.DESCRIPTION = exports.IMAGE = exports.PART = exports.SERIES = exports.SPECS = exports.DELIMETER = exports.QUESTION = exports.OPTION = exports.fieldNodesDict = void 0;
    exports.fieldNodesDict = {
        "fuse type": {
            type: "question",
            pathText: "Fuse Type: {{}}",
        },
        "fuse style": {
            type: "question",
            pathText: "Fuse Style: {{}}",
            questionStrategy: "masking-with-subcategories",
        },
        "max voltage": {
            type: "question",
            pathText: "Volts: {{}}V DC",
            questionStrategy: "hiding",
        },
        "max current": {
            type: "question",
            pathText: "Amps: {{}}A",
            questionStrategy: "hiding",
        },
        "circuit option": {
            type: "question",
            pathText: "Circuit Option: {{}}",
            questionStrategy: "masking",
        },
        style: {
            type: "question",
            pathText: "Style: {{}}",
            questionStrategy: "masking",
            skipif: ["PCBA", "Fuse Block / PDM"],
        },
        "mounting method": {
            type: "question",
            pathText: "Mounting: {{}}",
            questionStrategy: "masking-with-subcategories",
            skipBackIf: { style: ["PCBA", "Fuse Block / PDM"] },
        },
        protection: {
            type: "question",
            pathText: "Protection: {{}}",
            questionStrategy: "masking",
        },
        part: {
            type: "result",
            pathText: "",
        },
    };
    exports.OPTION = "answer";
    exports.QUESTION = "q";
    exports.DELIMETER = ":";
    exports.SPECS = "specs";
    exports.SERIES = "series";
    exports.PART = "part";
    exports.IMAGE = "img";
    exports.DESCRIPTION = "description";
    exports.DATASHEET = "datasheet";
    exports.PRINT = "2d print";
    exports.BUY_NOW = "buy-now";
    exports.PRODUCT_GUIDE = "product guide";
    exports.PATH = "path";
    exports.BACK = "back";
    exports.NAV = "nav";
    exports.RELATED_PRODUCTS = "related products";
    exports.ACCESSORIES = "accessories";
    exports.DIVIDER = ";";
    exports.MAX_RELATED_PRODUCTS = 2;
    exports.MAX_ACCESSORIES = 4;
});

define('modules/Observer',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Observable = exports.Observer = void 0;
    class Observer {
        constructor() {
            this.subscribers = new Set();
        }
        subscribe(fn) {
            this.subscribers.add(fn);
        }
        notify(value) {
            this.subscribers.forEach((fn) => fn(value));
        }
    }
    exports.Observer = Observer;
    class Observable extends Observer {
        constructor(initialValue) {
            super();
            this._value = initialValue;
        }
        get value() {
            return this._value;
        }
        set value(newVal) {
            if (this._value !== newVal) {
                this._value = newVal;
                this.notify(this._value);
            }
        }
    }
    exports.Observable = Observable;
});

define('modules/utils',["require", "exports", "./constants"], function (require, exports, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.capitalize = exports.getValueFromTags = void 0;
    const getValueFromTags = (tags, key, del = constants_1.DELIMETER) => {
        const foundTag = tags.find((tag) => tag.trim().startsWith(`${key}${del}`));
        if (foundTag) {
            return foundTag.split(constants_1.DELIMETER)[1].trim();
        }
        else {
            return "";
        }
    };
    exports.getValueFromTags = getValueFromTags;
    const capitalize = (text) => {
        if (!text) {
            return "";
        }
        const words = text
            .split(" ")
            .map((word) => word[0].toUpperCase() + word.slice(1));
        return words.join(" ");
    };
    exports.capitalize = capitalize;
});

define('modules/questionStrategies/QuestionStrategy',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuestionStrategy = void 0;
    class QuestionStrategy {
        constructor(name, experience) {
            this.name = name;
            this.experience = experience;
        }
    }
    exports.QuestionStrategy = QuestionStrategy;
});

define('modules/questionStrategies/HidingOptionsStrategy',["require", "exports", "./QuestionStrategy"], function (require, exports, QuestionStrategy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HidingOptionsStrategy = void 0;
    class HidingOptionsStrategy extends QuestionStrategy_1.QuestionStrategy {
        constructor(name, experience) {
            super(name, experience);
            this.isMobile =
                this.experience.findComponentsByTag("mobile").components.length > 0;
            this.isTablet =
                this.experience.findComponentsByTag("tablet").components.length > 0;
        }
        displayAnswerOptions(node) {
            const sortedNodes = node.children.sort((a, b) => Number(a.value) - Number(b.value));
            const evenOptions = this.experience.findLayersByTag(`${node.children[0].name.toLowerCase()}_even`);
            const oddOptions = this.experience.findLayersByTag(`${node.children[0].name.toLowerCase()}_odd`);
            if (this.isMobile || this.isTablet) {
                console.log("MOBILE LAYOUT!");
            }
            else {
                this.displayDesktopLayoutOptions(oddOptions, evenOptions, sortedNodes);
            }
        }
        displayDesktopLayoutOptions(oddOptions, evenOptions, sortedNodes) {
            if (sortedNodes.length % 2 === 0) {
                oddOptions.hide();
                evenOptions.show();
                this.handleTextOptions(evenOptions, sortedNodes);
            }
            else {
                oddOptions.show();
                evenOptions.hide();
                this.handleTextOptions(oddOptions, sortedNodes);
            }
        }
        handleTextOptions(options, nodes) {
            const collection = options.layers[0].findAllComponents();
            const max = collection.layersByTag.answer.length;
            const firstIndex = Math.floor((max - nodes.length) / 2);
            let answerIndex = 0;
            collection.components.forEach((comp) => {
                if (comp.type === "text") {
                    const currentIndex = answerIndex - firstIndex;
                    if (answerIndex >= firstIndex && currentIndex < nodes.length) {
                        comp.setText(nodes[currentIndex].value);
                        nodes[currentIndex].elementId = comp.id;
                    }
                    else {
                        comp.hide();
                    }
                    answerIndex++;
                }
                else if (comp.type === "line") {
                    this.handleLineDivider(comp, firstIndex, nodes);
                }
            });
        }
        handleLineDivider(comp, firstIndex, nodes) {
            const position = !isNaN(Number(comp.getPayload()))
                ? Number(comp.getPayload())
                : null;
            if (position) {
                if (!(position > firstIndex && position - firstIndex < nodes.length)) {
                    comp.hide();
                }
            }
            else {
                console.error(`there is no position number in payload of divider line with id ${comp.id} in question ${nodes[0].name}`);
            }
        }
    }
    exports.HidingOptionsStrategy = HidingOptionsStrategy;
});

define('modules/questionStrategies/MaskingOptionsStrategy',["require", "exports", "./QuestionStrategy"], function (require, exports, QuestionStrategy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MaskingOptionsStrategy = void 0;
    class MaskingOptionsStrategy extends QuestionStrategy_1.QuestionStrategy {
        constructor(name, experience, currentNodeObservable, CerosSDK) {
            super(name, experience);
            this.currentNodeObservable = currentNodeObservable;
            this.CerosSDK = CerosSDK;
            this.maskCollection = this.experience.findLayersByTag(`mask:${this.name}`);
        }
        displayAnswerOptions(node) {
            this.maskCollection.layers.forEach((comp) => {
                this.handleMasks(comp, node);
            });
        }
        handleMasks(mask, node) {
            const foundNode = node.findChildByValueProperty(mask.getPayload().trim());
            if (foundNode) {
                mask.hide();
            }
            else {
                mask.show();
            }
        }
        registerMaskAnimations() {
            this.maskCollection.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (mask) => {
                this.handleMasks(mask, this.currentNodeObservable.value);
            });
        }
    }
    exports.MaskingOptionsStrategy = MaskingOptionsStrategy;
});

define('modules/DoubleClickBugHandler',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DoubleClickBugHandler = void 0;
    class DoubleClickBugHandler {
        constructor() {
            this.clickObjectTimeTracker = {};
        }
        isDoubleClickBug(layerId) {
            const now = Date.now();
            const lastTime = this.clickObjectTimeTracker[layerId];
            this.clickObjectTimeTracker[layerId] = now;
            if (lastTime) {
                const timeBetweenClicks = now - lastTime;
                console.log(timeBetweenClicks);
                return timeBetweenClicks < 200;
            }
        }
    }
    exports.DoubleClickBugHandler = DoubleClickBugHandler;
});

define('modules/LandinPageProxy',["require", "exports", "./DoubleClickBugHandler"], function (require, exports, DoubleClickBugHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LandingPageProxy = void 0;
    class LandingPageProxy {
        constructor() {
            this.windowObjectReference = null;
            this.doubleClickBugHandler = new DoubleClickBugHandler_1.DoubleClickBugHandler();
            this.isPreview =
                window.self == window.top &&
                    window.location.hostname.includes(".preview.ceros");
        }
        // send UA event with outbound link info
        sendUAEvent(link) {
            if (window.self !== window.top) {
                const data = {
                    event_category: "CEROS",
                    event_label: link,
                    event_action: "outbound_link_click",
                };
                parent.postMessage(JSON.stringify(data), "*");
            }
            else {
                window.dataLayer.push({
                    event: "ceros-event",
                    cerosAction: "ceros_outbound_link_click",
                    cerosCategory: "CEROS",
                    cerosLabel: link,
                });
                this.openRequestedSingleTab(link);
            }
        }
        openRequestedSingleTab(url) {
            if (this.windowObjectReference === null ||
                this.windowObjectReference.closed) {
                this.windowObjectReference = window.open(url, "_blank");
            }
            else {
                this.windowObjectReference = window.open(url, "_blank");
                this.windowObjectReference.focus();
            }
        }
        openAndTrackLink(url, layerId) {
            if (!this.doubleClickBugHandler.isDoubleClickBug(layerId)) {
                if (this.isPreview) {
                    this.openRequestedSingleTab(url);
                }
                else {
                    this.sendUAEvent(url);
                }
            }
        }
    }
    exports.LandingPageProxy = LandingPageProxy;
});

define('modules/ModuleHandler',["require", "exports", "./constants"], function (require, exports, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModuleHandler = void 0;
    class ModuleHandler {
        constructor(moduleName, experience, CerosSDK, distributor, landingPageProxy) {
            this.moduleName = moduleName;
            this.experience = experience;
            this.CerosSDK = CerosSDK;
            this.distributor = distributor;
            this.landingPageProxy = landingPageProxy;
            this.moduleDict = {};
            this.isNew = false;
        }
        hideModule(type, index) {
            const moduleTag = this.getModuleTag(type, index);
            const module = this.experience.findLayersByTag(moduleTag);
            if (!module.layers.length) {
                console.error(`No module found with tag: ${moduleTag}`);
                return;
            }
            module.hide();
        }
        updateModule(type, index, data, processOverlayLayers) {
            const moduleTag = this.getModuleTag(type, index);
            const module = this.experience.findLayersByTag(moduleTag);
            if (!module.layers.length) {
                console.error(`No module found with tag: ${moduleTag}`);
                return;
            }
            const collection = module.layers[0].findAllComponents();
            const layersDict = collection.layersByTag;
            const size = type.toString();
            this.moduleDict[size] = this.moduleDict[size] || {};
            this.isNew = !this.moduleDict[size][moduleTag];
            // Ensure the entry exists before assignment
            if (!this.moduleDict[size][moduleTag]) {
                this.moduleDict[size][moduleTag] = { data: {}, layers: {} };
            }
            this.moduleDict[size][moduleTag].data = data;
            this.moduleDict[size][moduleTag].layers = layersDict;
            this.processLayers(layersDict, moduleTag);
            processOverlayLayers && processOverlayLayers(layersDict, moduleTag);
            console.log(this.moduleDict);
            module.show();
        }
        getModuleTag(type, index) {
            return type > 1
                ? `${type}-${this.moduleName}-${index + 1}`
                : `${type}-${this.moduleName}`;
        }
        processLayers(layersDict, moduleTag) {
            layersDict[constants_1.IMAGE] &&
                this.showImageFromUrl(moduleTag, this.handleModuleImage, layersDict[constants_1.IMAGE]);
            layersDict[constants_1.PART] &&
                this.updateResultTextbox(constants_1.PART, moduleTag, layersDict[constants_1.PART]);
            layersDict[constants_1.SERIES] &&
                this.updateResultTextbox(constants_1.SERIES, moduleTag, layersDict[constants_1.SERIES]);
            layersDict[constants_1.DATASHEET] &&
                this.registerResultClcikEvent(layersDict[constants_1.DATASHEET], constants_1.DATASHEET, moduleTag);
            layersDict[constants_1.PRINT] &&
                this.registerResultClcikEvent(layersDict[constants_1.PRINT], constants_1.PRINT, moduleTag);
            layersDict[constants_1.BUY_NOW] &&
                this.registerResultClcikEvent(layersDict[constants_1.BUY_NOW], this.distributor, moduleTag);
            layersDict[constants_1.PRODUCT_GUIDE] &&
                this.registerResultClcikEvent(layersDict[constants_1.PRODUCT_GUIDE], constants_1.PRODUCT_GUIDE, moduleTag);
            layersDict[constants_1.SPECS] &&
                this.updateResultTextbox(constants_1.SPECS, moduleTag, layersDict[constants_1.SPECS]);
            layersDict[constants_1.DESCRIPTION] &&
                this.updateResultTextbox(constants_1.DESCRIPTION, moduleTag, layersDict[constants_1.DESCRIPTION]);
        }
        showImageFromUrl(moduleTag, callback, imgArray) {
            imgArray.forEach((layer) => {
                const obj = this.getResultData(moduleTag);
                callback(layer, obj.data);
                this.isNew &&
                    layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
                        const obj = this.getResultData(moduleTag);
                        callback(layer, obj.data);
                    });
            });
        }
        updateResultTextbox(key, moduleTag, txtboxArray) {
            txtboxArray.forEach((layer) => {
                const obj = this.getResultData(moduleTag);
                layer.setText(obj.data[key]);
                this.isNew &&
                    layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (txtBox) => {
                        const obj = this.getResultData(moduleTag);
                        txtBox.setText(obj.data[key]);
                    });
            });
        }
        registerResultClcikEvent(layerArray, key, moduleTag) {
            layerArray.forEach((layer) => {
                layer.on(this.CerosSDK.EVENTS.CLICKED, () => {
                    const obj = this.getResultData(moduleTag);
                    this.landingPageProxy.openAndTrackLink(obj.data[key], layer.id);
                });
                layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
                    const dict = this.getResultData(moduleTag);
                    if (!dict.data[key]) {
                        layer.hide();
                    }
                });
            });
        }
        handleModuleImage(img, data) {
            const imgStr = data.image;
            try {
                new URL(imgStr);
                img.setUrl(imgStr);
            }
            catch (e) {
                console.error(e);
                img.setUrl("https://admin.ceros.com/v1/account/littelfuse/images/2025-06-17-60ecf7d1a494b7d0760c289a69b27a44-product-image-place-holder-jpg/proxy");
            }
        }
        getResultData(moduleTag) {
            const type = moduleTag.split("-")[0];
            return this.moduleDict[type][moduleTag];
        }
    }
    exports.ModuleHandler = ModuleHandler;
});

define('modules/Carousel',["require", "exports", "./Observer"], function (require, exports, Observer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Carousel = void 0;
    class Carousel {
        constructor(max, name, CerosSDK, experience, moduleHandler) {
            this.max = max;
            this.name = name;
            this.CerosSDK = CerosSDK;
            this.experience = experience;
            this.moduleHandler = moduleHandler;
            this.currentPage = new Observer_1.Observable(0);
            this.parts = [];
            this.next = this.experience.findLayersByTag(`${this.name}-next`);
            this.back = this.experience.findLayersByTag(`${this.name}-back`);
            this.currentIndex = this.experience.findComponentsByTag(`${this.name}-current`);
            this.totalIndex = this.experience.findComponentsByTag(`${this.name}-total`);
            this.pages = {};
            this.registerNavigationEvents();
        }
        init(parts) {
            this.pages = {};
            this.parts = parts;
            this.paginate();
            this.setTotalPageIndex();
            this.currentPage.value = 1;
        }
        paginate() {
            let i = 0;
            let pageNum = 1;
            while (i < this.parts.length) {
                const end = i + this.max < this.parts.length ? i + this.max : this.parts.length;
                this.pages[pageNum] = this.parts.slice(i, end);
                i = i + this.max;
                pageNum++;
            }
            console.log(this.pages);
        }
        registerNavigationEvents() {
            this.next.on(this.CerosSDK.EVENTS.CLICKED, () => {
                this.currentPage.value++;
            });
            this.back.on(this.CerosSDK.EVENTS.CLICKED, () => {
                this.currentPage.value--;
            });
            this.next.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, () => {
                if (this.isLastPage()) {
                    this.next.hide();
                }
            });
            this.back.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, () => {
                if (this.isFirstPage()) {
                    this.back.hide();
                }
            });
            this.currentPage.subscribe(() => {
                this.hideModules();
                this.updatePageIndex();
                this.populate();
                if (this.isLastPage()) {
                    this.next.hide();
                }
                else {
                    this.next.show();
                }
                if (this.isFirstPage()) {
                    this.back.hide();
                }
                else {
                    this.back.show();
                }
            });
        }
        populate() {
            let i = 0;
            const parts = this.pages[this.currentPage.value];
            while (i < this.max && i < parts.length) {
                const part = parts[i];
                if (part) {
                    this.moduleHandler.updateModule(this.max, i, part);
                }
                i++;
            }
        }
        hideModules() {
            let i = 0;
            while (i < this.max) {
                this.moduleHandler.hideModule(this.max, i);
                i++;
            }
        }
        updatePageIndex() {
            this.currentIndex.components.forEach((comp) => comp.setText(this.currentPage.value.toString()));
        }
        setTotalPageIndex() {
            const pageNums = Object.keys(this.pages);
            this.totalIndex.components.forEach((comp) => comp.setText(pageNums[pageNums.length - 1]));
        }
        isLastPage() {
            const pageNums = Object.keys(this.pages);
            return this.currentPage.value === Number(pageNums[pageNums.length - 1]);
        }
        isFirstPage() {
            return this.currentPage.value === 1;
        }
    }
    exports.Carousel = Carousel;
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define('modules/ResultHandler',["require", "exports", "./constants", "./LandinPageProxy", "./ModuleHandler", "./DoubleClickBugHandler", "./Carousel"], function (require, exports, constants_1, LandinPageProxy_1, ModuleHandler_1, DoubleClickBugHandler_1, Carousel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResultHandler = void 0;
    class ResultHandler {
        constructor(experience, CerosSDK, currentNodeObservable, distributor, relatedProductsLink, accessoriesLink, PapaParse) {
            this.experience = experience;
            this.CerosSDK = CerosSDK;
            this.currentNodeObservable = currentNodeObservable;
            this.distributor = distributor;
            this.relatedProductsLink = relatedProductsLink;
            this.accessoriesLink = accessoriesLink;
            this.PapaParse = PapaParse;
            this.csvData = {
                "related products": {},
                accessories: {},
            };
            this.overlayPartsState = {
                "related products": [],
                accessories: [],
            };
            this.doubleClickBugHandler = new DoubleClickBugHandler_1.DoubleClickBugHandler();
            this.landingPageProxy = new LandinPageProxy_1.LandingPageProxy();
            this.resultModulesHandler = new ModuleHandler_1.ModuleHandler("module", experience, CerosSDK, distributor, this.landingPageProxy);
            this.relatedProductsModulesHandler = new ModuleHandler_1.ModuleHandler(constants_1.RELATED_PRODUCTS, experience, CerosSDK, distributor, this.landingPageProxy);
            this.accessoriesModulesHandler = new ModuleHandler_1.ModuleHandler(constants_1.ACCESSORIES, experience, CerosSDK, distributor, this.landingPageProxy);
            this.accessoriesCarousel = new Carousel_1.Carousel(constants_1.MAX_ACCESSORIES, constants_1.ACCESSORIES, CerosSDK, experience, this.accessoriesModulesHandler);
            this.relatedProductsCarousel = new Carousel_1.Carousel(constants_1.MAX_RELATED_PRODUCTS, constants_1.RELATED_PRODUCTS, CerosSDK, experience, this.relatedProductsModulesHandler);
        }
        showResultModule(type) {
            this.updateResultModules(type);
            const moduleResultHotspot = this.experience.findComponentsByTag(`module-${type}`);
            moduleResultHotspot.click();
        }
        updateResultModules(type) {
            this.currentNodeObservable.value.children.forEach((node, index) => {
                this.resultModulesHandler.updateModule(type, index, node.data, this.processOverlayLayers.bind(this));
            });
        }
        processOverlayLayers(layersDict, moduleTag) {
            if (layersDict[constants_1.RELATED_PRODUCTS]) {
                this.handleOverlay(constants_1.RELATED_PRODUCTS, layersDict[constants_1.RELATED_PRODUCTS], moduleTag, this.relatedProductsLink);
            }
            layersDict[constants_1.ACCESSORIES] &&
                this.handleOverlay(constants_1.ACCESSORIES, layersDict[constants_1.ACCESSORIES], moduleTag, this.accessoriesLink);
        }
        updateRelatedProductsModules(parts) {
            if (parts.length < constants_1.MAX_RELATED_PRODUCTS) {
                parts.forEach((part, index) => {
                    this.relatedProductsModulesHandler.updateModule(parts.length, index, part);
                });
            }
            else {
                this.relatedProductsCarousel.init(parts);
            }
        }
        updateAccessoriesModules(parts) {
            if (parts.length < constants_1.MAX_ACCESSORIES) {
                parts.forEach((part, index) => {
                    this.accessoriesModulesHandler.updateModule(parts.length, index, part);
                });
            }
            else {
                this.accessoriesCarousel.init(parts);
            }
        }
        handleOverlay(name, layerArray, moduleTag, link) {
            layerArray.forEach((layer) => {
                this.registerOverlayAnimation(layer, moduleTag, name);
                this.registerOverlayClick(layer, moduleTag, name, link);
            });
        }
        registerOverlayAnimation(layer, moduleTag, name) {
            layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
                const items = this.getRelatedParts(moduleTag, name);
                if (items.length === 0) {
                    layer.hide();
                }
                else if (name === constants_1.ACCESSORIES) {
                    const hasRelatedProducts = !!this.getRelatedParts(moduleTag, constants_1.RELATED_PRODUCTS).length;
                    const hasProductGuide = !!this.getValue(moduleTag, constants_1.PRODUCT_GUIDE);
                    if (hasRelatedProducts || hasProductGuide) {
                        if (layer.getTags().find((tag) => tag === "pos:1")) {
                            layer.hide();
                        }
                    }
                    else {
                        if (layer.getTags().find((tag) => tag === "pos:2")) {
                            layer.hide();
                        }
                    }
                }
            });
        }
        registerOverlayClick(layer, moduleTag, name, link) {
            layer.on(this.CerosSDK.EVENTS.CLICKED, (layer) => __awaiter(this, void 0, void 0, function* () {
                if (this.doubleClickBugHandler.isDoubleClickBug(layer.id))
                    return;
                const items = this.getRelatedParts(moduleTag, name);
                if (!items.length)
                    return;
                yield this.loadCsvData(name, link);
                console.log(this.csvData[name]);
                const parts = this.getExistingParts(name, items);
                if (!parts.length)
                    return;
                if (name === constants_1.RELATED_PRODUCTS) {
                    this.updateRelatedProductsModules(parts);
                }
                else if (name === constants_1.ACCESSORIES) {
                    this.updateAccessoriesModules(parts);
                }
                const hotspotCollection = this.experience.findComponentsByTag(`${name}-${parts.length < 6 ? parts.length : "4+"}`);
                hotspotCollection.click();
            }));
        }
        getRelatedParts(moduleTag, name) {
            const value = this.getValue(moduleTag, name);
            const items = value ? value.split(constants_1.DIVIDER).map((str) => str.trim()) : [];
            return items;
        }
        getValue(moduleTag, name) {
            const dict = this.resultModulesHandler.getResultData(moduleTag);
            return dict.data[name];
        }
        getExistingParts(overlay, names) {
            const parts = [];
            names.forEach((name) => {
                if (this.csvData[overlay][name]) {
                    parts.push(this.csvData[overlay][name]);
                }
                else {
                    console.error(`could not find part: ${name} from ${overlay}!`);
                }
            });
            return parts;
        }
        loadCsvData(name, link) {
            return new Promise((resolve, reject) => {
                if (this.csvData[name] && Object.keys(this.csvData[name]).length > 0) {
                    resolve(this.csvData[name]);
                }
                else {
                    this.PapaParse.parse(link, {
                        header: true,
                        download: true,
                        complete: (results) => {
                            const data = this.indexByPartNumber(results.data);
                            this.csvData[name] = data;
                            resolve(this.csvData[name]);
                        },
                        error: (error) => reject(error),
                    });
                }
            });
        }
        indexByPartNumber(data) {
            const result = {};
            data.forEach((obj) => {
                result[obj.part] = obj;
            });
            return result;
        }
    }
    exports.ResultHandler = ResultHandler;
});

define('modules/questionStrategies/MaskingOptionsWithSubCategoriesStrategy',["require", "exports", "./MaskingOptionsStrategy"], function (require, exports, MaskingOptionsStrategy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MaskingOptionsWithSubcategoriesStrategy = void 0;
    class MaskingOptionsWithSubcategoriesStrategy extends MaskingOptionsStrategy_1.MaskingOptionsStrategy {
        displayAnswerOptions(node) {
            console.log(node.name);
            const categoryLayersCollection = this.experience.findLayersByTag(`cat:${node.children[0].name}`);
            categoryLayersCollection.layers.forEach((layer) => {
                if (layer.getPayload().trim() === node.value) {
                    layer.show();
                }
                else {
                    layer.hide();
                }
            });
            this.maskCollection.layers.forEach((comp) => {
                this.handleMasks(comp, node);
            });
        }
    }
    exports.MaskingOptionsWithSubcategoriesStrategy = MaskingOptionsWithSubcategoriesStrategy;
});

/// <reference path="../../types/papaparse.d.ts" />
define('modules/QuizContext',["require", "exports", "./constants", "./Observer", "./utils", "./questionStrategies/HidingOptionsStrategy", "./questionStrategies/MaskingOptionsStrategy", "./ResultHandler", "./DoubleClickBugHandler", "./questionStrategies/MaskingOptionsWithSubCategoriesStrategy"], function (require, exports, constants_1, Observer_1, utils_1, HidingOptionsStrategy_1, MaskingOptionsStrategy_1, ResultHandler_1, DoubleClickBugHandler_1, MaskingOptionsWithSubCategoriesStrategy_1) {
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
            this.resultHandler = new ResultHandler_1.ResultHandler(experience, CerosSDK, this.currentNode, distributor, relatedProductsLink, accessoriesLink, PapaParse);
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

define('modules/Node',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Node = void 0;
    class Node {
        constructor(name, value = "", parent = null) {
            this.name = name;
            this.value = value;
            this.parent = parent;
            this.children = [];
            this.elementId = "";
            this.data = {};
        }
        findChildByValueProperty(value) {
            return (this.children.find((child) => child.value.toLowerCase() === value.toLowerCase()) || null);
        }
        findParentByName(name) {
            let node = this;
            while (node) {
                if (node.name === name) {
                    return node;
                }
                node = node.parent;
            }
        }
        getPath() {
            const path = [];
            let currentNode = this;
            while (currentNode) {
                path.unshift({ name: currentNode.name, value: currentNode.value });
                currentNode = currentNode.parent;
            }
            return path;
        }
    }
    exports.Node = Node;
});

define('modules/NodeTree',["require", "exports", "./Node"], function (require, exports, Node_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeTree = void 0;
    class NodeTree {
        constructor(fields) {
            this.fields = fields;
            // constructor(public fields: string[]) {
            this.root = new Node_1.Node("Root");
        }
        buildTree(data) {
            data.forEach((obj) => {
                this.addBranch(this.root, obj);
            });
            console.log(this.root);
        }
        addNewNode(val, name, parent, obj = {}) {
            const foundNode = parent.findChildByValueProperty(val);
            if (!foundNode) {
                const node = new Node_1.Node(name, val, parent);
                node.data = obj;
                parent.children.push(node);
                return node;
            }
            else {
                return foundNode;
            }
        }
        addBranch(node, obj) {
            let parent = node;
            const fieldNames = Object.keys(this.fields);
            for (let i = 0; i < fieldNames.length; i++) {
                const key = fieldNames[i].trim();
                // for (let i = 0; i < this.fields.length; i++) {
                //   const key = this.fields[i].trim();
                // const val = obj[key].trim();
                const val = obj[key].trim();
                if (this.fields[fieldNames[i]].type === "result") {
                    parent = this.addNewNode(val, key, parent, obj);
                }
                else {
                    parent = this.addNewNode(val, key, parent);
                }
            }
        }
        findChild(parentNode, key, value) {
            return parentNode.children.find((node) => node[key].toLowerCase() === value.toLowerCase().trim());
        }
    }
    exports.NodeTree = NodeTree;
});


/// <reference path="../types/CerosSDK.d.ts" />
/// <reference path="../types/papaparse.d.ts" />
const script = document.getElementById("fuse-holders");
if (script === null) {
    throw Error("Could not find script fuse-holders");
}
const link = script.getAttribute("data-link") || "";
const distributor = script.getAttribute("data-distributor") || "";
const relatedProductsLink = script.getAttribute("data-related-products") || "";
const accessoriesLink = script.getAttribute("data-accessories") || "";
// Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
// let absUrl = "./";
// const srcAttribute = script.getAttribute("src");
// Check that a src attibute was defined, and code hasn't been inlined by third party
// if (typeof srcAttribute === "string" && new URL(srcAttribute)) {
//   const srcURL = new URL(srcAttribute);
//   const path = srcURL.pathname;
//   const projectDirectory = path.split("/").slice(0, -1).join("/") + "/";
//   absUrl = srcURL.origin + projectDirectory;
// }
if (typeof require !== "undefined" && typeof require === "function") {
    require.config({
        baseUrl: "http://127.0.0.1:5173/",
        paths: {
            CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
            PapaParse: "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min",
        },
    });
    require([
        "CerosSDK",
        "PapaParse",
        "modules/QuizContext",
        "modules/NodeTree",
        "modules/constants",
    ], function (CerosSDK, PapaParse, QuizModule, NodeTreeModule, constants) {
        CerosSDK.findExperience()
            .done((experience) => {
            console.log(experience);
            const nodeTree = new NodeTreeModule.NodeTree(constants.fieldNodesDict);
            PapaParse.parse(link, {
                download: true,
                header: true,
                complete: (result) => {
                    nodeTree.buildTree(result.data);
                    const quiz = new QuizModule.QuizContext(CerosSDK, experience, nodeTree, distributor, relatedProductsLink, accessoriesLink, PapaParse);
                },
            });
        })
            .fail((e) => {
            console.log(e);
        });
    });
}
;
define("main", function(){});

