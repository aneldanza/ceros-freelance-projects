define('modules/constants',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_IMAGE = exports.TAB = exports.FUSE_TYPE_INFO = exports.FUSE_STYLE_INFO = exports.PATH1 = exports.PATH2 = exports.IMG_LRG = exports.MCASE_ADAPTER = exports.MAX_TABS = exports.MOBILE_MAX_ITEMS = exports.MAX_RESULTS = exports.MAX_ACCESSORIES = exports.MAX_RELATED_PRODUCTS = exports.DIVIDER = exports.SEGMENTS = exports.PARTS = exports.RESULTS = exports.ACCESSORIES = exports.RELATED_PRODUCTS = exports.NAV = exports.BACK = exports.PATH = exports.PRODUCT_GUIDE = exports.BUY_NOW = exports.PRINT = exports.DATASHEET = exports.DESCRIPTION = exports.IMAGE = exports.PART = exports.SERIES = exports.SPECS = exports.DELIMETER = exports.RESET = exports.QUESTION = exports.OPTION = exports.fieldNodesDict = exports.path1Fields = exports.path2Fields = exports.transitionFields = void 0;
    exports.transitionFields = {
        "fuse type": "fuse type-path2",
        "fuse style": "fuse style-path2",
        "max voltage": "max voltage-path2",
        "max current": "max current-path2",
    };
    exports.path2Fields = [
        "fuse type",
        "application voltage",
        "application load",
        "application amps",
        "fuse style-path2",
    ];
    exports.path1Fields = [
        "fuse type",
        "fuse style",
        "max voltage",
        "max current",
        "circuit option",
        "style",
        "mounting method",
        "protection",
        "part",
    ];
    exports.fieldNodesDict = {
        "application voltage": {
            type: "question",
            pathText: "Voltage: {{}}",
        },
        "application load": {
            type: "question",
            pathText: "Load: {{}}",
            questionStrategy: "masking",
            multiValue: true,
        },
        "application amps": {
            type: "question",
            pathText: "Amps: {{}}",
            questionStrategy: "slider",
        },
        "fuse style-path2": {
            type: "question",
            pathText: "Style: {{}}",
            questionStrategy: "segments",
        },
        "max voltage-path2": {
            type: "question",
            pathText: "Volts: <={{}}V DC",
            breakKeys: true,
        },
        "max current-path2": {
            type: "question",
            pathText: "Amps: {{}}A",
            breakKeys: true,
        },
        "fuse type": {
            type: "question",
            pathText: "Fuse Type: {{}}",
        },
        "fuse type-path2": {
            type: "question",
            pathText: "{{}}",
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
            pathText: "Circuit: {{}}",
            questionStrategy: "masking",
        },
        style: {
            type: "question",
            pathText: "Style: {{}}",
            questionStrategy: "masking",
            skipif: ["PCBA", "Fuse Block"],
        },
        "mounting method": {
            type: "question",
            pathText: "Mounting: {{}}",
            questionStrategy: "masking-with-subcategories",
            skipBackIf: { style: ["PCBA", "Fuse Block"] },
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
    exports.RESET = "reset";
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
    exports.RESULTS = "module";
    exports.PARTS = "part module";
    exports.SEGMENTS = "segment";
    exports.DIVIDER = ";";
    exports.MAX_RELATED_PRODUCTS = 2;
    exports.MAX_ACCESSORIES = 4;
    exports.MAX_RESULTS = 5;
    exports.MOBILE_MAX_ITEMS = 1;
    exports.MAX_TABS = 4;
    exports.MCASE_ADAPTER = "mcase-adapter";
    exports.IMG_LRG = "img lrg";
    exports.PATH2 = "path2";
    exports.PATH1 = "path1";
    exports.FUSE_STYLE_INFO = "fuse style info";
    exports.FUSE_TYPE_INFO = "fuse type info";
    exports.TAB = "tab";
    exports.DEFAULT_IMAGE = "https://ceros-projects.s3.us-east-2.amazonaws.com/littlefuse/fuse-holders/Image+Not+Available.jpg";
});

define('modules/lib/Node',["require", "exports"], function (require, exports) {
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
        findChildThatIncludesValue(value) {
            return (this.children.find((child) => child.value.toLowerCase() === value.toLowerCase()) || null);
        }
        findAllChildrenThatIncludeValue(value) {
            return (this.children.filter((child) => child.value.toLowerCase() === value.toLowerCase()) || null);
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

define('modules/lib/treeHelpers',["require", "exports", "../constants"], function (require, exports, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MERGE_FIELDS_P1 = void 0;
    exports.makeKey = makeKey;
    exports.makeKeys = makeKeys;
    exports.getChildrenByPath = getChildrenByPath;
    exports.getP1MergeValsFromP2Node = getP1MergeValsFromP2Node;
    exports.MERGE_FIELDS_P1 = [
        "fuse type",
        "fuse style",
        "max voltage",
        "max current",
    ];
    function normalize(v) {
        return (v !== null && v !== void 0 ? v : "").trim().toLowerCase().replace(/\s+/g, " ");
    }
    function makeKey(obj, fields) {
        return fields.map((f) => normalize(obj[f]) || "∅").join("|");
    }
    function expandRow(row, fieldNodesDict, delimiter = ",") {
        const entries = Object.entries(row);
        // Start with a single empty row, then build up combinations
        let acc = [{}];
        for (const [key, rawValue] of entries) {
            const def = fieldNodesDict[constants_1.transitionFields[key]];
            const value = rawValue !== null && rawValue !== void 0 ? rawValue : "";
            // Decide whether to split
            const parts = (def === null || def === void 0 ? void 0 : def.breakKeys) && value.includes(delimiter)
                ? value
                    .split(delimiter)
                    .map((v) => v.trim())
                    .filter(Boolean)
                : [value];
            // Expand accumulator with this field’s options
            acc = parts.flatMap((part) => acc.map((r) => (Object.assign(Object.assign({}, r), { [key]: part }))));
        }
        return acc;
    }
    function makeKeys(obj, fields, fieldNodesDict) {
        const keys = [];
        const names = Object.keys(obj);
        const multiValueNames = names.filter((n) => fieldNodesDict[constants_1.transitionFields[n]].breakKeys);
        if (multiValueNames.length) {
            const valsArray = expandRow(obj, fieldNodesDict, ",");
            valsArray.forEach((vals) => keys.push(makeKey(vals, fields)));
        }
        else {
            keys.push(makeKey(obj, fields));
        }
        return keys;
    }
    function getChildrenByPath(path, path1Root) {
        const values = path.split("|");
        const collection = getAllChildren(0, path1Root, values, []);
        return collection;
    }
    function getAllChildren(step, node, values, collection) {
        if (step === exports.MERGE_FIELDS_P1.length) {
            return node.children;
        }
        const children = node.findAllChildrenThatIncludeValue(values[step]);
        children.forEach((child) => {
            collection = collection.concat(getAllChildren(step + 1, child, values, collection));
        });
        return collection;
    }
    function getP1MergeValsFromP2Node(node, tf) {
        const out = {};
        //   const path = node.getPath();
        for (const p1 of exports.MERGE_FIELDS_P1) {
            const p2 = tf[p1] || p1;
            const v = node.data[p2];
            if (!v)
                return null;
            out[p1] = v;
        }
        return out;
    }
});

define('modules/lib/NodeTree',["require", "exports", "./Node", "./treeHelpers", "./treeHelpers"], function (require, exports, Node_1, treeHelpers_1, treeHelpers_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeTree = void 0;
    class NodeTree {
        constructor(fields) {
            this.fields = fields;
            this.root = new Node_1.Node("Root");
        }
        buildTree(data, fieldNames) {
            data.forEach((obj) => {
                this.addBranch(this.root, obj, fieldNames);
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
        addBranch(node, obj, fieldNames) {
            var _a, _b;
            let parent = node;
            for (let i = 0; i < fieldNames.length; i++) {
                const key = fieldNames[i].trim();
                const val = (_b = (_a = obj[key]) === null || _a === void 0 ? void 0 : _a.trim) === null || _b === void 0 ? void 0 : _b.call(_a);
                if (!val)
                    continue;
                if (this.fields[key].multiValue) {
                    const remainingFields = fieldNames.slice(i + 1);
                    const values = obj[key].split(",").map((val) => val.trim());
                    values.forEach((value) => {
                        // const node = this.addNewNode(value, key, parent);
                        let newNode;
                        if (this.fields[key].type === "result" ||
                            this.fields[key].questionStrategy === "segments" ||
                            i === fieldNames.length - 1) {
                            newNode = this.addNewNode(value, key, parent, obj);
                        }
                        else {
                            newNode = this.addNewNode(value, key, parent);
                        }
                        this.addBranch(newNode, obj, remainingFields);
                    });
                    return;
                }
                if (this.fields[key].type === "result" ||
                    this.fields[key].questionStrategy === "segments" ||
                    i === fieldNames.length - 1) {
                    parent = this.addNewNode(val, key, parent, obj);
                }
                else {
                    parent = this.addNewNode(val, key, parent);
                }
            }
        }
        mergeNodes(parent, transitionFields, path1NodeTree) {
            const vals = (0, treeHelpers_2.getP1MergeValsFromP2Node)(parent, transitionFields);
            if (vals) {
                const keys = (0, treeHelpers_1.makeKeys)(vals, treeHelpers_1.MERGE_FIELDS_P1, this.fields);
                let combined = [];
                keys.forEach((key) => {
                    const children = (0, treeHelpers_1.getChildrenByPath)(key, path1NodeTree.root);
                    combined = [...combined, ...children];
                });
                this.attachNewChildren(combined, parent);
            }
        }
        attachNewChildren(children, parent) {
            if (!children || children.length === 0)
                return;
            children.forEach((node) => {
                const newParent = this.addNewNode(node.value, node.name, parent, node.data);
                const children = node.children;
                this.attachNewChildren(children, newParent);
            });
        }
        mergeDataWithFields(path1NodeTree, path2Root, transitionFields) {
            const visit = (n) => {
                if (n.children.length === 0) {
                    this.mergeNodes(n, transitionFields, path1NodeTree);
                    // No need to descend below merge depth
                    return;
                }
                // keep walking until we hit the last node
                for (const c of n.children)
                    visit(c);
            };
            // start below Root; Root itself can’t be a merge node
            for (const c of path2Root.children)
                visit(c);
        }
        findChild(parentNode, key, value) {
            return parentNode.children.find((node) => node[key].toLowerCase() === value.toLowerCase().trim());
        }
    }
    exports.NodeTree = NodeTree;
});

define('modules/Observer',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NonStrictObservable = exports.Observable = exports.Observer = void 0;
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
    class NonStrictObservable extends Observer {
        constructor(initialValue) {
            super();
            this._value = initialValue;
        }
        get value() {
            return this._value;
        }
        set value(newVal) {
            this._value = newVal;
            this.notify(this._value);
        }
    }
    exports.NonStrictObservable = NonStrictObservable;
});

define('modules/utils',["require", "exports", "./constants"], function (require, exports, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isMobile = exports.setImageUrl = exports.getModuleTag = exports.stepsFromFieldNames = exports.capitalize = exports.getValueFromTags = void 0;
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
    const stepsFromFieldNames = (fieldNames, allSteps) => {
        const entries = fieldNames.map((name) => [name, allSteps[name]]);
        return Object.fromEntries(entries);
    };
    exports.stepsFromFieldNames = stepsFromFieldNames;
    const getModuleTag = (length, index, moduleName) => {
        return length > 1
            ? `${length}-${moduleName}-${index + 1}`
            : `${length}-${moduleName}`;
    };
    exports.getModuleTag = getModuleTag;
    const setImageUrl = (imgStr, img) => {
        try {
            new URL(imgStr);
            img.setUrl(imgStr);
        }
        catch (e) {
            console.error(e);
            img.setUrl(constants_1.DEFAULT_IMAGE);
        }
    };
    exports.setImageUrl = setImageUrl;
    const isMobile = (experience) => {
        return experience.findComponentsByTag("mobile").components.length > 0;
    };
    exports.isMobile = isMobile;
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
                return timeBetweenClicks < 900;
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

define('modules/moduleStrategies/ModuleHandler',["require", "exports", "../utils", "../DoubleClickBugHandler"], function (require, exports, utils_1, DoubleClickBugHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModuleHandler = void 0;
    class ModuleHandler {
        constructor(moduleName, experience, CerosSDK) {
            this.moduleName = moduleName;
            this.experience = experience;
            this.CerosSDK = CerosSDK;
            this.moduleDict = {};
            this.isNew = false;
            this.doubleClickBugHandler = new DoubleClickBugHandler_1.DoubleClickBugHandler();
        }
        static handleModuleImage(img, data) {
            const imgStr = data.image;
            (0, utils_1.setImageUrl)(imgStr, img);
        }
        updateModule(type, index, data, processOverlayLayers, isLittelfusePick) {
            const moduleTag = (0, utils_1.getModuleTag)(type, index, this.moduleName);
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
            this.processLayers(layersDict, moduleTag, isLittelfusePick);
            processOverlayLayers && processOverlayLayers(layersDict, moduleTag);
            console.log(this.moduleDict);
            module.show();
        }
        showImageFromUrl(moduleTag, callback, imgArray, onClickCallback) {
            imgArray.forEach((layer) => {
                const obj = this.getResultData(moduleTag);
                callback(layer, obj.data);
                this.isNew &&
                    layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
                        const obj = this.getResultData(moduleTag);
                        callback(layer, obj.data);
                    });
                onClickCallback &&
                    this.isNew &&
                    layer.on(this.CerosSDK.EVENTS.CLICKED, (layer) => {
                        onClickCallback(moduleTag);
                    });
            });
        }
        updateResultTextbox(key, moduleTag, txtboxArray, format) {
            txtboxArray.forEach((layer) => {
                const obj = this.getResultData(moduleTag);
                const text = format ? format(obj.data[key]) : obj.data[key];
                layer.setText(text);
                this.isNew &&
                    layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (txtBox) => {
                        const obj = this.getResultData(moduleTag);
                        const text = format ? format(obj.data[key]) : obj.data[key];
                        txtBox.setText(text);
                    });
            });
        }
        getResultData(moduleTag) {
            const type = moduleTag.split("-")[0];
            return this.moduleDict[type][moduleTag];
        }
        hideModule(type, index) {
            const moduleTag = (0, utils_1.getModuleTag)(type, index, this.moduleName);
            const module = this.experience.findLayersByTag(moduleTag);
            if (!module.layers.length) {
                console.error(`No module found with tag: ${moduleTag}`);
                return;
            }
            module.hide();
        }
    }
    exports.ModuleHandler = ModuleHandler;
});

define('modules/moduleStrategies/ProductModuleHandler',["require", "exports", "../constants", "./ModuleHandler", "../utils"], function (require, exports, constants_1, ModuleHandler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProductModuleHandler = void 0;
    class ProductModuleHandler extends ModuleHandler_1.ModuleHandler {
        constructor(moduleName, experience, CerosSDK, distributor, landingPageProxy, imgLrgLink) {
            super(moduleName, experience, CerosSDK);
            this.distributor = distributor;
            this.landingPageProxy = landingPageProxy;
            this.imgLrgLink = imgLrgLink;
            this.imgLargeHotspotCollection = this.experience.findComponentsByTag(`${constants_1.IMG_LRG}-1`);
        }
        processLayers(layersDict, moduleTag, isLittelfusePick) {
            layersDict[constants_1.IMAGE] &&
                this.showImageFromUrl(moduleTag, ModuleHandler_1.ModuleHandler.handleModuleImage, layersDict[constants_1.IMAGE], this.imageClickCallback.bind(this));
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
            layersDict["pick"] &&
                this.handleLittelfusePick(layersDict["pick"], !!isLittelfusePick);
        }
        handleLittelfusePick(layerArray, isLittelfusePick) {
            if (isLittelfusePick) {
                layerArray.forEach((l) => l.show());
            }
            else {
                layerArray.forEach((l) => l.hide());
            }
        }
        imageClickCallback(moduleTag) {
            if (!(0, utils_1.isMobile)(this.experience)) {
                const currentObj = this.getResultData(moduleTag);
                this.imgLrgLink.value = currentObj.data.image;
                this.imgLargeHotspotCollection.click();
            }
        }
        registerResultClcikEvent(layerArray, key, moduleTag) {
            layerArray.forEach((layer) => {
                if (this.isNew) {
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
                }
                else if ((0, utils_1.isMobile)(this.experience) && key === constants_1.PRODUCT_GUIDE) {
                    const dict = this.getResultData(moduleTag);
                    if (!dict.data[key]) {
                        layer.hide();
                    }
                    else {
                        layer.show();
                    }
                }
            });
        }
    }
    exports.ProductModuleHandler = ProductModuleHandler;
});

define('modules/Carousel',["require", "exports", "./Observer", "./DoubleClickBugHandler"], function (require, exports, Observer_1, DoubleClickBugHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Carousel = void 0;
    class Carousel {
        constructor(max, name, CerosSDK, experience, moduleHandler, processOverlayLayers) {
            this.max = max;
            this.name = name;
            this.CerosSDK = CerosSDK;
            this.experience = experience;
            this.moduleHandler = moduleHandler;
            this.processOverlayLayers = processOverlayLayers;
            this.currentPage = new Observer_1.NonStrictObservable(0);
            this.parts = [];
            this.next = this.experience.findLayersByTag(`${this.name}-next`);
            this.back = this.experience.findLayersByTag(`${this.name}-back`);
            this.backMask = this.experience.findLayersByTag(`${this.name}-mask-back`);
            this.nextMask = this.experience.findLayersByTag(`${this.name}-mask-next`);
            this.currentIndex = this.experience.findComponentsByTag(`${this.name}-current`);
            this.totalIndex = this.experience.findComponentsByTag(`${this.name}-total`);
            this.pages = {};
            this.doubleClickBugHandler = new DoubleClickBugHandler_1.DoubleClickBugHandler();
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
            this.next.on(this.CerosSDK.EVENTS.CLICKED, (layer) => {
                if (this.doubleClickBugHandler.isDoubleClickBug(layer.id))
                    return;
                this.currentPage.value++;
                console.log(this.currentPage.value);
            });
            this.back.on(this.CerosSDK.EVENTS.CLICKED, (layer) => {
                if (this.doubleClickBugHandler.isDoubleClickBug(layer.id))
                    return;
                this.currentPage.value--;
            });
            // this.next.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, () => {
            //   if (this.isLastPage()) {
            //     this.next.hide();
            //   }
            // });
            // this.back.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, () => {
            //   if (this.isFirstPage()) {
            //     this.back.hide();
            //   }
            // });
            this.currentPage.subscribe(() => {
                this.hideModules();
                this.updatePageIndex();
                this.populate();
                if (this.isLastPage()) {
                    // this.next.hide();
                    // this.back.show();
                    this.nextMask.show();
                    this.backMask.hide();
                }
                else if (this.isFirstPage()) {
                    // this.back.hide();
                    // this.next.show();
                    this.backMask.show();
                    this.nextMask.hide();
                }
                else {
                    // this.back.show();
                    // this.next.show();
                    this.backMask.hide();
                    this.nextMask.hide();
                }
            });
        }
        populate() {
            let i = 0;
            const parts = this.pages[this.currentPage.value];
            while (i < this.max && i < parts.length) {
                const part = parts[i];
                if (part) {
                    const isLittelfusePick = this.currentPage.value === 1;
                    this.moduleHandler.updateModule(this.max, i, part, this.processOverlayLayers, isLittelfusePick);
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

define('modules/moduleStrategies/NavModuleHandler',["require", "exports", "./ModuleHandler"], function (require, exports, ModuleHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NavModuleHandler = void 0;
    class NavModuleHandler extends ModuleHandler_1.ModuleHandler {
        constructor(moduleName, experience, CerosSDK, currentSegment, textFormat) {
            super(moduleName, experience, CerosSDK);
            this.currentSegment = currentSegment;
            this.textFormat = textFormat;
        }
        processLayers(layersDict, moduleTag) {
            layersDict["name"] &&
                this.updateResultTextbox("name", moduleTag, layersDict["name"], this.textFormat);
            layersDict["cta"] &&
                this.registerTabChangeCta("name", moduleTag, layersDict["cta"]);
        }
        selectTab(tabName, length) {
            const modules = this.moduleDict[length];
            for (const moduleTag in modules) {
                const module = modules[moduleTag];
                if (module.data.name === tabName) {
                    module.layers.cta.forEach((layer) => {
                        layer.click();
                        console.log(`clicked ${tabName}`);
                    });
                }
            }
        }
        registerTabChangeCta(key, moduleTag, layerArray) {
            layerArray.forEach((layer) => {
                layer.on(this.CerosSDK.EVENTS.CLICKED, (layer) => {
                    if (this.doubleClickBugHandler.isDoubleClickBug(layer.id))
                        return;
                    const obj = this.getResultData(moduleTag);
                    this.currentSegment.value = obj.data[key];
                });
            });
        }
    }
    exports.NavModuleHandler = NavModuleHandler;
});

define('modules/moduleStrategies/TabNavHandler',["require", "exports", "./NavModuleHandler", "../Observer", "../constants"], function (require, exports, NavModuleHandler_1, Observer_1, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TabNavHandler = void 0;
    class TabNavHandler {
        constructor(experience, CerosSDK, showResultModule, tabTag, tabTextTag, tabKey, textFormat) {
            this.experience = experience;
            this.CerosSDK = CerosSDK;
            this.showResultModule = showResultModule;
            this.tabTag = tabTag;
            this.tabTextTag = tabTextTag;
            this.tabKey = tabKey;
            this.textFormat = textFormat;
            this.segments = {};
            this.currentSegment = new Observer_1.NonStrictObservable("");
            this.navModuleHandler = new NavModuleHandler_1.NavModuleHandler(tabTag, experience, CerosSDK, this.currentSegment, this.textFormat);
            this.tabTextComponentCollection =
                experience.findComponentsByTag(tabTextTag);
            this.subscribeToSegmentChange();
        }
        init(node) {
            this.segments = {};
            this.mapSegments(node.children);
        }
        subscribeToSegmentChange() {
            this.currentSegment.subscribe(this.displayModules.bind(this));
            this.currentSegment.subscribe(this.updateFuseTypeInfo.bind(this));
        }
        display() {
            this.updateNavigation();
            this.triggerHotspot(this.tabTag, Object.keys(this.segments).length, 3);
            const initialValue = Object.keys(this.segments)[0];
            this.navModuleHandler.selectTab(initialValue, Object.keys(this.segments).length.toString());
        }
        mapSegments(nodes) {
            nodes.forEach((node) => {
                const type = node.data[this.tabKey].trim();
                this.segments[type] = this.segments[type] || {};
                this.segments[type].nodes = this.segments[type].nodes || [];
                this.segments[type].nodes.push(node);
            });
        }
        displayModules() {
            const length = this.segments[this.currentSegment.value]
                ? this.segments[this.currentSegment.value].nodes.length
                : 0;
            if (length) {
                this.showResultModule(length, this.segments[this.currentSegment.value].nodes);
            }
            else {
                console.log("No options in segement " + this.currentSegment.value);
            }
        }
        updateFuseTypeInfo() {
            const fuseType = this.segments[this.currentSegment.value].nodes[0].data[this.tabTextTag];
            this.tabTextComponentCollection.setText(fuseType);
        }
        updateNavigation() {
            const length = Object.keys(this.segments).length;
            if (length) {
                this.updateNavModules(length);
                this.triggerHotspot(this.tabTag, length, constants_1.MAX_TABS);
            }
        }
        updateNavModules(length) {
            const fuseTypes = Object.keys(this.segments);
            fuseTypes.forEach((fuseType, index) => {
                this.navModuleHandler.updateModule(length, index, { name: fuseType });
            });
        }
        triggerHotspot(name, length, max) {
            const hotspotCollection = this.experience.findComponentsByTag(`${name}-${length <= max ? length : `${max + 1}+`}`);
            hotspotCollection.click();
        }
        isOneTab(nodes) {
            const tabName = nodes[0].data[this.tabKey];
            return nodes.every((child) => child.data[this.tabKey] === tabName);
        }
    }
    exports.TabNavHandler = TabNavHandler;
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
define('modules/ResultHandler',["require", "exports", "./constants", "./LandinPageProxy", "./moduleStrategies/ProductModuleHandler", "./DoubleClickBugHandler", "./Carousel", "./moduleStrategies/TabNavHandler", "./utils"], function (require, exports, constants_1, LandinPageProxy_1, ProductModuleHandler_1, DoubleClickBugHandler_1, Carousel_1, TabNavHandler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResultHandler = void 0;
    class ResultHandler {
        constructor(experience, CerosSDK, currentNodeObservable, distributor, relatedProductsLink, accessoriesLink, PapaParse, imgLrgLink) {
            this.experience = experience;
            this.CerosSDK = CerosSDK;
            this.currentNodeObservable = currentNodeObservable;
            this.distributor = distributor;
            this.relatedProductsLink = relatedProductsLink;
            this.accessoriesLink = accessoriesLink;
            this.PapaParse = PapaParse;
            this.imgLrgLink = imgLrgLink;
            this.csvData = {
                "related products": {},
                accessories: {},
            };
            this.maxResultItems = constants_1.MAX_RESULTS;
            this.maxRelatedProducts = constants_1.MAX_RELATED_PRODUCTS;
            this.maxAccessories = constants_1.MAX_ACCESSORIES;
            this.doubleClickBugHandler = new DoubleClickBugHandler_1.DoubleClickBugHandler();
            if ((0, utils_1.isMobile)(experience)) {
                this.maxResultItems = constants_1.MOBILE_MAX_ITEMS;
                this.maxRelatedProducts = constants_1.MOBILE_MAX_ITEMS;
                this.maxAccessories = constants_1.MOBILE_MAX_ITEMS;
            }
            this.pathNavigationCollection = experience.findLayersByTag(`nav:${constants_1.PART}`);
            this.landingPageProxy = new LandinPageProxy_1.LandingPageProxy();
            this.resultModulesHandler = new ProductModuleHandler_1.ProductModuleHandler(constants_1.RESULTS, experience, CerosSDK, distributor, this.landingPageProxy, this.imgLrgLink);
            this.relatedProductsModulesHandler = new ProductModuleHandler_1.ProductModuleHandler(constants_1.RELATED_PRODUCTS, experience, CerosSDK, distributor, this.landingPageProxy, this.imgLrgLink);
            this.accessoriesModulesHandler = new ProductModuleHandler_1.ProductModuleHandler(constants_1.ACCESSORIES, experience, CerosSDK, distributor, this.landingPageProxy, this.imgLrgLink);
            this.accessoriesCarousel = new Carousel_1.Carousel(this.maxAccessories, constants_1.ACCESSORIES, CerosSDK, experience, this.accessoriesModulesHandler);
            this.relatedProductsCarousel = new Carousel_1.Carousel(this.maxRelatedProducts, constants_1.RELATED_PRODUCTS, CerosSDK, experience, this.relatedProductsModulesHandler);
            this.resultsCarousel = new Carousel_1.Carousel(this.maxResultItems, constants_1.RESULTS, CerosSDK, experience, this.resultModulesHandler, this.processOverlayLayers.bind(this));
            this.tabNavHandler = new TabNavHandler_1.TabNavHandler(this.experience, this.CerosSDK, this.showPath2Results.bind(this), constants_1.TAB, "", "max current", this.formatTabText);
        }
        formatTabText(val) {
            return `${val}A`;
        }
        displayPathNavigation(pathName) {
            this.pathNavigationCollection.layers.forEach((layer) => {
                if (layer.getPayload().trim() === pathName) {
                    layer.show();
                }
                else {
                    layer.hide();
                }
            });
        }
        showResultModule(length, pathName) {
            if (pathName === constants_1.PATH2) {
                this.tabNavHandler.init(this.currentNodeObservable.value);
                // if there is only one tab, display resuls without tab navigation
                if (this.tabNavHandler.isOneTab(this.currentNodeObservable.value.children)) {
                    this.showPath1Results(length);
                }
                this.tabNavHandler.display();
                // }
            }
            else {
                this.showPath1Results(length);
            }
        }
        showPath1Results(length) {
            this.updateResultModules(length, this.currentNodeObservable.value.children);
            this.triggerHotspot(constants_1.RESULTS, length, this.maxResultItems);
        }
        showPath2Results(length, nodes) {
            this.updateResultModules(length, nodes);
            this.triggerHotspot(constants_1.RESULTS, length, this.maxResultItems);
        }
        sortNodesBySales(nodes) {
            return nodes.sort((a, b) => {
                const aSales = isNaN(Number(a.data.sales)) ? 0 : Number(a.data.sales);
                const bSales = isNaN(Number(b.data.sales)) ? 0 : Number(b.data.sales);
                return bSales - aSales;
            });
        }
        updateResultModules(type, nodes) {
            const results = this.sortNodesBySales(nodes);
            if (results.length <= this.maxResultItems) {
                results.forEach((node, index) => {
                    this.resultModulesHandler.updateModule(type, index, node.data, this.processOverlayLayers.bind(this));
                });
            }
            else {
                this.resultsCarousel.init(results.map((node) => node.data));
            }
        }
        processOverlayLayers(layersDict, moduleTag) {
            if (layersDict[constants_1.RELATED_PRODUCTS]) {
                this.handleOverlay(constants_1.RELATED_PRODUCTS, layersDict[constants_1.RELATED_PRODUCTS], moduleTag, this.relatedProductsLink);
            }
            layersDict[constants_1.ACCESSORIES] &&
                this.handleOverlay(constants_1.ACCESSORIES, layersDict[constants_1.ACCESSORIES], moduleTag, this.accessoriesLink);
        }
        updateRelatedProductsModules(parts) {
            if (parts.length <= this.maxRelatedProducts) {
                parts.forEach((part, index) => {
                    this.relatedProductsModulesHandler.updateModule(parts.length, index, part);
                });
            }
            else {
                this.relatedProductsCarousel.init(parts);
            }
        }
        updateAccessoriesModules(parts) {
            if (parts.length <= this.maxAccessories) {
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
                if (this.resultModulesHandler.isNew) {
                    this.registerOverlayAnimation(layer, moduleTag, name);
                    this.registerOverlayClick(layer, moduleTag, name, link);
                }
                else {
                    this.handleButtonDisplay(layer, moduleTag, name);
                }
            });
        }
        handleButtonDisplay(l, moduleTag, name) {
            const items = this.getPartNumbers(moduleTag, name);
            if (items.length === 0) {
                l.hide();
            }
            else if (name === constants_1.ACCESSORIES) {
                const hasRelatedProducts = !!this.getPartNumbers(moduleTag, constants_1.RELATED_PRODUCTS).length;
                const hasProductGuide = !!this.getValue(moduleTag, constants_1.PRODUCT_GUIDE);
                if (hasRelatedProducts || hasProductGuide) {
                    if (l.getTags().find((tag) => tag === "pos:1")) {
                        l.hide();
                    }
                    else {
                        l.show();
                    }
                }
                else {
                    if (l.getTags().find((tag) => tag === "pos:2")) {
                        l.hide();
                    }
                    else {
                        l.show();
                    }
                }
            }
            else {
                l.show();
            }
        }
        registerOverlayAnimation(layer, moduleTag, name) {
            layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (l) => {
                const items = this.getPartNumbers(moduleTag, name);
                if (items.length === 0) {
                    l.hide();
                }
                else if (name === constants_1.ACCESSORIES) {
                    const hasRelatedProducts = !!this.getPartNumbers(moduleTag, constants_1.RELATED_PRODUCTS).length;
                    const hasProductGuide = !!this.getValue(moduleTag, constants_1.PRODUCT_GUIDE);
                    if (hasRelatedProducts || hasProductGuide) {
                        if (l.getTags().find((tag) => tag === "pos:1")) {
                            l.hide();
                        }
                    }
                    else {
                        if (l.getTags().find((tag) => tag === "pos:2")) {
                            l.hide();
                        }
                    }
                }
            });
        }
        registerOverlayClick(layer, moduleTag, overlayName, link) {
            layer.on(this.CerosSDK.EVENTS.CLICKED, (layer) => __awaiter(this, void 0, void 0, function* () {
                if (this.doubleClickBugHandler.isDoubleClickBug(layer.id))
                    return;
                const partNumbers = this.getPartNumbers(moduleTag, overlayName);
                if (!partNumbers.length)
                    return;
                yield this.loadCsvData(overlayName, link);
                const parts = this.getExistingParts(overlayName, partNumbers);
                if (!parts.length)
                    return;
                if (overlayName === constants_1.RELATED_PRODUCTS) {
                    this.updateRelatedProductsModules(parts);
                    this.triggerHotspot(overlayName, parts.length, this.maxRelatedProducts);
                }
                else if (overlayName === constants_1.ACCESSORIES) {
                    this.updateAccessoriesModules(parts);
                    this.triggerHotspot(overlayName, parts.length, this.maxAccessories);
                }
            }));
        }
        triggerHotspot(name, length, max) {
            const hotspotCollection = this.experience.findComponentsByTag(`${name}-${length <= max ? length : `${max + 1}+`}`);
            hotspotCollection.click();
        }
        getPartNumbers(moduleTag, name) {
            const value = this.getValue(moduleTag, name);
            return value ? value.split(constants_1.DIVIDER).map((str) => str.replace(" ", "")) : [];
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
                result[obj.part.trim()] = obj;
            });
            return result;
        }
    }
    exports.ResultHandler = ResultHandler;
});

define('modules/questionStrategies/QuestionStrategy',["require", "exports", "../constants", "../Observer"], function (require, exports, constants_1, Observer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuestionStrategy = void 0;
    class QuestionStrategy {
        constructor(name, experience, CerosSDK) {
            this.name = name;
            this.experience = experience;
            this.CerosSDK = CerosSDK;
            this.key = "value";
            this.optionsCollection = experience.findComponentsByTag(`q:${name}`);
            this.pathNavigationCollection = experience.findLayersByTag(`nav:${name}`);
            this.selectedOption = new Observer_1.NonStrictObservable(`${name}:${this.key}:`);
        }
        displayPathNavigation(pathName) {
            if (pathName === constants_1.PATH2) {
                const path2NavCollection = this.experience.findComponentsByTag("show-path2-nav");
                path2NavCollection.click();
            }
            else {
                const path1NavCollection = this.experience.findComponentsByTag("show-path1-nav");
                path1NavCollection.click();
            }
        }
    }
    exports.QuestionStrategy = QuestionStrategy;
});

define('modules/questionStrategies/MaskingOptionsStrategy',["require", "exports", "./QuestionStrategy"], function (require, exports, QuestionStrategy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MaskingOptionsStrategy = void 0;
    class MaskingOptionsStrategy extends QuestionStrategy_1.QuestionStrategy {
        constructor(name, experience, CerosSDK, currentNodeObservable) {
            super(name, experience, CerosSDK);
            this.currentNodeObservable = currentNodeObservable;
            this.key = "value";
            this.maskCollection = this.experience.findLayersByTag(`mask:${this.name}`);
            this.registerCerosEvents();
            this.registerMaskAnimations();
        }
        registerCerosEvents() {
            this.optionsCollection.on(this.CerosSDK.EVENTS.CLICKED, this.handleOptionClick.bind(this));
        }
        handleOptionClick(comp) {
            const answer = comp.getPayload().trim() || "";
            const array = this.selectedOption.value.split(":");
            array[1] = this.key;
            array[2] = answer;
            this.selectedOption.value = array.join(":");
        }
        displayAnswerOptions(node) {
            this.maskCollection.layers.forEach((mask) => {
                // this.handleMasks(comp, node);
                const foundNode = node.findChildByValueProperty(mask.getPayload().trim());
                if (foundNode) {
                    mask.hide();
                }
                else {
                    mask.show();
                }
            });
        }
        handleMasks(mask, node) {
            const foundNode = node.findChildByValueProperty(mask.getPayload().trim());
            if (foundNode) {
                mask.hide();
            }
            else {
                // mask.show();
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

define('modules/questionStrategies/MaskOptionsStrateyWithMultipleCellValues',["require", "exports", "./MaskingOptionsStrategy"], function (require, exports, MaskingOptionsStrategy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MaskingOptionsStrategyWithMultipleCellValues = void 0;
    class MaskingOptionsStrategyWithMultipleCellValues extends MaskingOptionsStrategy_1.MaskingOptionsStrategy {
        handleMasks(mask, node) {
            const foundNode = node.findChildThatIncludesValue(mask.getPayload().trim());
            if (foundNode) {
                mask.hide();
            }
            else {
                mask.show();
            }
        }
    }
    exports.MaskingOptionsStrategyWithMultipleCellValues = MaskingOptionsStrategyWithMultipleCellValues;
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

define('modules/questionStrategies/HidingOptionsStrategy',["require", "exports", "./QuestionStrategy", "../utils"], function (require, exports, QuestionStrategy_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HidingOptionsStrategy = void 0;
    class HidingOptionsStrategy extends QuestionStrategy_1.QuestionStrategy {
        constructor(name, experience, CerosSDK) {
            super(name, experience, CerosSDK);
            this.key = "elementId";
            this.isMobile = (0, utils_1.isMobile)(experience);
            this.isTablet =
                this.experience.findComponentsByTag("tablet").components.length > 0;
            this.evenOptions = this.experience.findLayersByTag(`${name.toLowerCase()}_even`);
            this.oddOptions = this.experience.findLayersByTag(`${name.toLowerCase()}_odd`);
            this.registerCerosEvents();
        }
        registerCerosEvents() {
            this.optionsCollection.on(this.CerosSDK.EVENTS.CLICKED, this.handleOptionClick.bind(this));
        }
        handleOptionClick(comp) {
            const answer = comp.id;
            const array = this.selectedOption.value.split(":");
            array[1] = this.key;
            array[2] = answer;
            this.selectedOption.value = array.join(":");
        }
        displayAnswerOptions(node) {
            const sortedNodes = node.children.sort((a, b) => Number(a.value) - Number(b.value));
            if (this.isMobile || this.isTablet) {
                console.log("MOBILE LAYOUT!");
                // there are two possible rows available
                // each row has odd or even option: odd - 1 or 3 items, even - 2 items
                // divide sorted nodes between the rows
                //  call displayMobileOptions for each row
                let firstRowNodes = [];
                let secondRowNodes = [];
                if (sortedNodes.length === 4) {
                    firstRowNodes = sortedNodes.slice(0, 2);
                    secondRowNodes = sortedNodes.slice(2);
                }
                else {
                    firstRowNodes = sortedNodes.slice(0, 3);
                    secondRowNodes = sortedNodes.slice(3);
                }
                this.displayMobileLayoutOptions(firstRowNodes, 1);
                secondRowNodes.length
                    ? this.displayMobileLayoutOptions(secondRowNodes, 2)
                    : this.hideMobileOptionsRow(2);
            }
            else {
                this.displayLayoutOptions(sortedNodes, this.handleTextOptions.bind(this));
            }
        }
        hideMobileOptionsRow(rowNum) {
            const oddOptions = this.experience.findLayersByTag(`${this.name}-${rowNum}-odd`);
            const evenOptions = this.experience.findLayersByTag(`${this.name}-${rowNum}-even`);
            oddOptions.hide();
            evenOptions.hide();
        }
        displayMobileLayoutOptions(sortedNodes, rowNum) {
            const oddOptions = this.experience.findLayersByTag(`${this.name}-${rowNum}-odd`);
            const evenOptions = this.experience.findLayersByTag(`${this.name}-${rowNum}-even`);
            if (sortedNodes.length % 2 === 0) {
                oddOptions.hide();
                evenOptions.show();
                this.handleMobileTextOptions(evenOptions, sortedNodes);
            }
            else {
                oddOptions.show();
                evenOptions.hide();
                this.handleMobileTextOptions(oddOptions, sortedNodes);
            }
        }
        displayLayoutOptions(sortedNodes, handleOptions) {
            if (sortedNodes.length % 2 === 0) {
                this.oddOptions.hide();
                this.evenOptions.show();
                handleOptions(this.evenOptions, sortedNodes);
            }
            else {
                this.oddOptions.show();
                this.evenOptions.hide();
                handleOptions(this.oddOptions, sortedNodes);
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
            const position = Number(comp.getPayload());
            if (position) {
                if (!(position > firstIndex && position - firstIndex < nodes.length)) {
                    comp.hide();
                }
            }
            else {
                console.error(`there is no position number in payload of divider line with id ${comp.id} in question ${nodes[0].name}`);
            }
        }
        handleMobileTextOptions(options, nodes) {
            const collection = options.layers[0].findAllComponents();
            if (nodes.length === 1) {
                this.handleOneOptionInMobileView(nodes, collection);
            }
            else {
                this.handleTextOptions(options, nodes);
            }
        }
        handleOneOptionInMobileView(nodes, collection) {
            let answerIndex = 0;
            collection.layers.forEach((layer) => {
                if (layer.type === "text") {
                    if (answerIndex === 1) {
                        layer.setText(nodes[0].value);
                        nodes[0].elementId = layer.id;
                    }
                    else {
                        layer.hide();
                    }
                    answerIndex++;
                }
                else {
                    layer.hide();
                }
            });
        }
    }
    exports.HidingOptionsStrategy = HidingOptionsStrategy;
});

define('modules/questionStrategies/SliderOptionsStrategy',["require", "exports", "../Observer", "./QuestionStrategy"], function (require, exports, Observer_1, QuestionStrategy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SliderOptionsStrategy = void 0;
    class SliderOptionsStrategy extends QuestionStrategy_1.QuestionStrategy {
        constructor(name, experience, CerosSDK) {
            super(name, experience, CerosSDK);
            this.currentIndex = new Observer_1.Observable(0);
            this.sliderValues = [];
            this.nextButtonMask = experience.findLayersByTag(`${name}-mask`);
            this.nextButton = experience.findLayersByTag(`${name}-next`);
            this.singleOptionCollection = experience.findLayersByTag("single-option");
            this.sliderContainer = document.getElementById("slider-container");
            this.output = document.getElementById("slider-value");
            this.slider = null;
            this.registerCerosEvents();
            this.subscribeToObservables();
        }
        subscribeToObservables() {
            this.currentIndex.subscribe(this.handleNextButtonDisplay.bind(this));
            this.currentIndex.subscribe(this.updateSliderBackground.bind(this));
            this.currentIndex.subscribe(this.updateSliderValuePosition.bind(this));
        }
        registerCerosEvents() {
            this.optionsCollection.on(this.CerosSDK.EVENTS.CLICKED, this.handleOptionClick.bind(this));
        }
        handleNextButtonDisplay(index) {
            if (index > 0) {
                this.nextButtonMask.hide();
                this.nextButton.show();
            }
            else {
                this.nextButton.hide();
                this.nextButtonMask.show();
            }
        }
        handleOptionClick(_) {
            const answer = this.sliderValues.length === 2
                ? this.sliderValues[1].toString()
                : this.sliderValues[this.currentIndex.value].toString();
            const array = this.selectedOption.value.split(":");
            array[1] = this.key;
            array[2] = answer;
            this.selectedOption.value = array.join(":");
        }
        getSliderContainer() {
            return this.sliderContainer;
        }
        getOutput() {
            return this.output;
        }
        displayAnswerOptions(node) {
            const nodeValues = node.children.map((node) => Number(node.value));
            if (this.slider) {
                this.slider.remove();
                this.slider = null;
            }
            if (this.sliderContainer && this.output) {
                this.displayOutput(nodeValues, this.sliderContainer, this.output);
            }
            else {
                const interval = setInterval(() => {
                    const sliderContainer = document.getElementById("slider-container");
                    const output = document.getElementById("slider-value");
                    if (sliderContainer && output) {
                        clearInterval(interval);
                        this.sliderContainer = sliderContainer;
                        this.output = output;
                        this.displayOutput(nodeValues, this.sliderContainer, this.output);
                    }
                }, 200);
            }
        }
        displayOutput(nodeValues, sliderContainer, output) {
            this.sliderValues = [0, ...nodeValues];
            console.log(this.sliderValues);
            if (nodeValues.length > 1) {
                this.singleOptionCollection.hide();
                this.displaySlider(sliderContainer, output);
                if (this.slider) {
                    this.currentIndex.value = 0;
                    this.slider.style.display = "block";
                    if (this.output)
                        this.output.style.display = "block";
                    this.handleNextButtonDisplay(this.currentIndex.value);
                }
            }
            else {
                if (this.slider)
                    this.slider.style.display = "none";
                if (this.output)
                    this.output.style.display = "none";
                this.nextButton.hide();
                this.nextButtonMask.hide();
                const sliderInfo = this.experience.findLayersByTag("slider-info");
                sliderInfo.hide();
                this.displaySingleOption(nodeValues);
            }
        }
        displaySingleOption(nodeValues) {
            this.singleOptionCollection.layers.forEach((layer) => layer.setText(`${nodeValues[0]}`));
            this.singleOptionCollection.show();
        }
        displaySlider(sliderContainer, output) {
            this.registerNewSlider(sliderContainer, output);
        }
        registerNewSlider(sliderContainer, output) {
            const slider = this.getSlider(sliderContainer);
            this.slider = slider;
            // if (isMobile(this.experience)) {
            // } else {
            this.slider.addEventListener("input", (event) => {
                const target = event.target;
                // Ensure target is valid and the value is a number
                if (target && !isNaN(Number(target.value))) {
                    this.currentIndex.value = parseInt(target.value, 10);
                }
            });
            // }
            this.updateSliderValuePosition();
        }
        updateSliderValuePosition() {
            console.log(`index: ${this.currentIndex.value}`);
            console.log(`value: ${this.sliderValues[this.currentIndex.value]}`);
            if (this.slider && this.output) {
                const percent = this.currentIndex.value / (this.sliderValues.length - 1);
                const sliderWidth = this.slider.offsetWidth;
                const thumbWidth = 32;
                const sliderLeft = this.slider.offsetLeft;
                // Calculate thumb position within slider
                const thumbX = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;
                // Position the value element
                this.output.style.left = `${sliderLeft + thumbX}px`;
                this.output.textContent =
                    this.currentIndex.value === 0
                        ? "A"
                        : `${this.sliderValues[this.currentIndex.value]}A`;
            }
        }
        // updateSliderBackground() {
        //   if (this.slider) {
        //     const percent =
        //       (this.currentIndex.value / (this.sliderValues.length - 1)) * 100;
        //     const trackStyle = `linear-gradient(to right, #5CC883 0%, #008752 ${percent}%, #ccc ${percent}%, #ccc 100%)`;
        //     this.slider.style.background = trackStyle;
        //   }
        // }
        updateSliderBackground() {
            if (this.slider) {
                const percent = (this.currentIndex.value / (this.sliderValues.length - 1)) * 100;
                // WebKit-only logic (Chrome, Safari, Edge)
                const isWebKit = "WebkitAppearance" in document.documentElement.style;
                if (isWebKit) {
                    const trackStyle = `linear-gradient(
        to right,
        #5CC883 0%,
        #008752 ${percent}%,
        #ccc ${percent}%,
        #ccc 100%
      )`;
                    this.slider.style.background = trackStyle;
                }
            }
        }
        getSlider(sliderContainer) {
            const slider = sliderContainer.querySelector("#customSlider");
            if (!slider) {
                const newSlider = this.createSlider(this.sliderValues.length - 1);
                sliderContainer.prepend(newSlider);
                return newSlider;
            }
            else {
                return slider;
            }
        }
        createSlider(size) {
            const slider = document.createElement("input");
            slider.type = "range";
            slider.id = "customSlider";
            slider.min = "0";
            slider.max = size.toString();
            slider.value = "0";
            return slider;
        }
    }
    exports.SliderOptionsStrategy = SliderOptionsStrategy;
});

define('modules/moduleStrategies/PartModuleHandler',["require", "exports", "./ModuleHandler", "../constants", "../utils"], function (require, exports, ModuleHandler_1, constants_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartModuleHandler = void 0;
    class PartModuleHandler extends ModuleHandler_1.ModuleHandler {
        constructor(moduleName, experience, CerosSDK, qName, selectedOption) {
            super(moduleName, experience, CerosSDK);
            this.qName = qName;
            this.selectedOption = selectedOption;
        }
        processLayers(layersDict, moduleTag) {
            console.log("proccessing part layers");
            layersDict[constants_1.IMAGE] &&
                this.showImageFromUrl(moduleTag, this.displayPartImage.bind(this), layersDict[constants_1.IMAGE]);
            layersDict[this.qName] &&
                this.updateResultTextbox(this.qName, moduleTag, layersDict[this.qName]);
            layersDict[constants_1.FUSE_STYLE_INFO] &&
                this.updateResultTextbox(constants_1.FUSE_STYLE_INFO, moduleTag, layersDict[constants_1.FUSE_STYLE_INFO]);
            layersDict[`q:${this.qName}`] &&
                this.registerOptionClick(this.qName, moduleTag, layersDict[`q:${this.qName}`]);
        }
        registerOptionClick(key, moduleTag, layerArray) {
            layerArray.forEach((layer) => {
                layer.on(this.CerosSDK.EVENTS.CLICKED, () => {
                    const obj = this.getResultData(moduleTag);
                    const answer = obj.data[key];
                    const array = this.selectedOption.value.split(":");
                    array[2] = answer;
                    this.selectedOption.value = array.join(":");
                });
            });
        }
        displayPartImage(imgLayer, data) {
            const strUrl = data[`${this.qName.split("-")[0]} image`];
            (0, utils_1.setImageUrl)(strUrl, imgLayer);
        }
    }
    exports.PartModuleHandler = PartModuleHandler;
});

define('modules/questionStrategies/SegmentedOptionsStrategy',["require", "exports", "../constants", "../moduleStrategies/PartModuleHandler", "./QuestionStrategy", "../moduleStrategies/TabNavHandler", "../Carousel", "../utils"], function (require, exports, constants_1, PartModuleHandler_1, QuestionStrategy_1, TabNavHandler_1, Carousel_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SegmentedOptionsStrategy = void 0;
    class SegmentedOptionsStrategy extends QuestionStrategy_1.QuestionStrategy {
        constructor(name, experience, CerosSDK) {
            super(name, experience, CerosSDK);
            this.maxParts = 3;
            this.partModuleHandler = new PartModuleHandler_1.PartModuleHandler(constants_1.PARTS, experience, CerosSDK, name, this.selectedOption);
            this.tabNavHandler = new TabNavHandler_1.TabNavHandler(experience, CerosSDK, this.showResultModules.bind(this), constants_1.SEGMENTS, constants_1.FUSE_TYPE_INFO, `fuse type-${constants_1.PATH2}`);
            this.maxParts = (0, utils_1.isMobile)(experience) ? constants_1.MOBILE_MAX_ITEMS : 3;
            this.partsCarousel = new Carousel_1.Carousel(this.maxParts, constants_1.PARTS, CerosSDK, experience, this.partModuleHandler);
        }
        displayAnswerOptions(node) {
            this.tabNavHandler.init(node);
            this.tabNavHandler.display();
        }
        showResultModules(length, nodes) {
            this.updateResultModules(length, nodes);
            this.triggerHotspot(constants_1.PARTS, length, this.maxParts);
        }
        updateResultModules(length, nodes) {
            if (length <= this.maxParts) {
                nodes.forEach((node, index) => {
                    this.partModuleHandler.updateModule(length, index, node.data);
                });
            }
            else {
                this.partsCarousel.init(nodes.map((node) => node.data));
            }
        }
        triggerHotspot(name, length, max) {
            const hotspotCollection = this.experience.findComponentsByTag(`${name}-${length <= max ? length : `${max + 1}+`}`);
            hotspotCollection.click();
        }
    }
    exports.SegmentedOptionsStrategy = SegmentedOptionsStrategy;
});

define('modules/questionStrategies/QuestionStrategyFactory',["require", "exports", "./MaskingOptionsStrategy", "./MaskOptionsStrateyWithMultipleCellValues", "./MaskingOptionsWithSubCategoriesStrategy", "./HidingOptionsStrategy", "./SliderOptionsStrategy", "./SegmentedOptionsStrategy"], function (require, exports, MaskingOptionsStrategy_1, MaskOptionsStrateyWithMultipleCellValues_1, MaskingOptionsWithSubCategoriesStrategy_1, HidingOptionsStrategy_1, SliderOptionsStrategy_1, SegmentedOptionsStrategy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuestionStrategyFactory = void 0;
    class QuestionStrategyFactory {
        static create(fieldName, field, experience, currentNode, CerosSDK) {
            switch (field.questionStrategy) {
                case "hiding":
                    return new HidingOptionsStrategy_1.HidingOptionsStrategy(fieldName, experience, CerosSDK);
                case "masking-with-subcategories":
                    return new MaskingOptionsWithSubCategoriesStrategy_1.MaskingOptionsWithSubcategoriesStrategy(fieldName, experience, CerosSDK, currentNode);
                case "masking-with-mulitiple-cell-values":
                    return new MaskOptionsStrateyWithMultipleCellValues_1.MaskingOptionsStrategyWithMultipleCellValues(fieldName, experience, CerosSDK, currentNode);
                case "slider":
                    return new SliderOptionsStrategy_1.SliderOptionsStrategy(fieldName, experience, CerosSDK);
                case "segments":
                    return new SegmentedOptionsStrategy_1.SegmentedOptionsStrategy(fieldName, experience, CerosSDK);
                case "masking":
                default:
                    return new MaskingOptionsStrategy_1.MaskingOptionsStrategy(fieldName, experience, CerosSDK, currentNode);
            }
        }
    }
    exports.QuestionStrategyFactory = QuestionStrategyFactory;
});

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
define('modules/QuizContext',["require", "exports", "./constants", "./lib/NodeTree", "./Observer", "./utils", "./ResultHandler", "./DoubleClickBugHandler", "./moduleStrategies/ProductModuleHandler", "./questionStrategies/QuestionStrategyFactory", "./moduleStrategies/ModuleHandler"], function (require, exports, constants_1, NodeTree_1, Observer_1, utils_1, ResultHandler_1, DoubleClickBugHandler_1, ProductModuleHandler_1, QuestionStrategyFactory_1, ModuleHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuizContext = void 0;
    class QuizContext {
        constructor(CerosSDK, experience, nodeTree, distributor, relatedProductsLink, accessoriesLink, PapaParse, path2Link) {
            this.CerosSDK = CerosSDK;
            this.experience = experience;
            this.distributor = distributor;
            this.relatedProductsLink = relatedProductsLink;
            this.accessoriesLink = accessoriesLink;
            this.PapaParse = PapaParse;
            this.path2Link = path2Link;
            this.questions = {};
            this.imgLargeOverlayCollection = this.experience.findLayersByTag(constants_1.IMG_LRG);
            this.imgLrgLink = new Observer_1.Observable("");
            this.imgLrgCloseHotspotCollection = this.experience.findLayersByTag(`${constants_1.IMG_LRG}-close`);
            this.path2NodeTree = null;
            this.currentTree = nodeTree;
            this.path1NodeTree = nodeTree;
            this.currentNode = new Observer_1.Observable(nodeTree.root);
            this.backLayersCollection = this.experience.findLayersByTag(constants_1.BACK);
            this.navCollecttion = this.experience.findComponentsByTag(constants_1.NAV);
            this.pathTextCollection = this.experience.findComponentsByTag(constants_1.PATH);
            this.resetCollection = this.experience.findLayersByTag(constants_1.RESET);
            this.mcaseAdapterCtaCollection = this.experience.findLayersByTag(`${constants_1.MCASE_ADAPTER}-cta`);
            this.resultHandler = new ResultHandler_1.ResultHandler(experience, CerosSDK, this.currentNode, distributor, relatedProductsLink, accessoriesLink, PapaParse, this.imgLrgLink);
            this.mcaseAdapterModuleHandler = new ProductModuleHandler_1.ProductModuleHandler(constants_1.MCASE_ADAPTER, experience, CerosSDK, distributor, this.resultHandler.landingPageProxy, this.imgLrgLink);
            this.doubleClickHandler = new DoubleClickBugHandler_1.DoubleClickBugHandler();
            this.init();
        }
        init() {
            this.subscribeCurrentNodeObserver();
            this.subscribeToCerosEvents();
            this.assignQuestionsStrategy();
            this.registerImageOverlay();
        }
        registerImageOverlay() {
            this.imgLargeOverlayCollection.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
                ModuleHandler_1.ModuleHandler.handleModuleImage(layer, {
                    image: this.imgLrgLink.value,
                });
            });
            this.imgLrgCloseHotspotCollection.on(this.CerosSDK.EVENTS.CLICKED, () => {
                this.imgLrgLink.value = "";
            });
            this.imgLrgLink.subscribe((link) => {
                this.imgLargeOverlayCollection.layers.forEach((layer) => {
                    ModuleHandler_1.ModuleHandler.handleModuleImage(layer, { image: link });
                });
            });
        }
        subscribeCurrentNodeObserver() {
            this.currentNode.subscribe(this.handleNodeChange.bind(this));
            this.currentNode.subscribe(this.updatePath.bind(this));
        }
        assignQuestionsStrategy() {
            for (const fieldName in constants_1.fieldNodesDict) {
                const field = constants_1.fieldNodesDict[fieldName];
                if (field.type === "question") {
                    const strategy = QuestionStrategyFactory_1.QuestionStrategyFactory.create(fieldName, field, this.experience, this.currentNode, this.CerosSDK);
                    this.questions[fieldName] = strategy;
                    strategy.selectedOption.subscribe(this.handleSelectedAnswer.bind(this));
                }
            }
        }
        subscribeToCerosEvents() {
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
            this.currentNode.value = this.currentTree.root;
        }
        handleSelectedAnswer(selection) {
            return __awaiter(this, void 0, void 0, function* () {
                const [qName, key, answer] = selection.split(":");
                if (qName === "fuse type") {
                    if (answer.toLowerCase() === "guide me") {
                        //load path2 csv data
                        this.currentTree = yield this.loadCsvDataIntoNodeTree();
                    }
                    else {
                        this.currentTree = this.path1NodeTree;
                    }
                    this.currentNode.value = this.currentTree.root;
                }
                const nextNode = this.currentTree.findChild(this.currentNode.value, key, answer);
                if (nextNode) {
                    this.updateCurrentNodeValue(nextNode, qName, answer);
                }
                else {
                    console.error(`coudn't find node with ${qName} and value ${answer}`);
                }
            });
        }
        updateCurrentNodeValue(nextNode, qName, answer) {
            if (constants_1.fieldNodesDict[qName].skipif &&
                constants_1.fieldNodesDict[qName].skipif.find((str) => str === answer) &&
                nextNode.children.length) {
                this.currentNode.value = nextNode.children[0];
            }
            else {
                this.currentNode.value = nextNode;
            }
        }
        loadCsvDataIntoNodeTree() {
            if (this.path2NodeTree)
                return Promise.resolve(this.path2NodeTree);
            const tree = new NodeTree_1.NodeTree(constants_1.fieldNodesDict);
            return new Promise((resolve, reject) => {
                this.PapaParse.parse(this.path2Link, {
                    header: true,
                    download: true,
                    complete: (result) => {
                        tree.buildTree(result.data, constants_1.path2Fields);
                        tree.mergeDataWithFields(this.path1NodeTree, tree.root, constants_1.transitionFields);
                        this.path2NodeTree = tree;
                        resolve(tree);
                    },
                    error: (error) => reject(error),
                });
            });
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
            console.log(`clicked back to ${current.name}`);
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
            if (this.doubleClickHandler.isDoubleClickBug(comp.id))
                return;
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
            if (node.children.length) {
                if (this.isLastQuestion(node)) {
                    const pathName = this.currentTree === this.path1NodeTree ? constants_1.PATH1 : constants_1.PATH2;
                    this.resultHandler.showResultModule(node.children.length, pathName);
                    this.handlePathNavigation(this.resultHandler);
                }
                else {
                    const childNodeName = node.children[0].name.toLowerCase();
                    const step = this.questions[childNodeName];
                    if (step) {
                        step.displayAnswerOptions(node);
                        this.handlePathNavigation(step);
                    }
                }
                console.log(this.currentNode.value);
            }
        }
        handlePathNavigation(handler) {
            if (this.currentTree === this.path2NodeTree) {
                handler.displayPathNavigation(constants_1.PATH2);
            }
            else {
                handler.displayPathNavigation(constants_1.PATH1);
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
                const template = name === "fuse type" && this.currentTree === this.path2NodeTree
                    ? "{{}}"
                    : constants_1.fieldNodesDict[name].pathText;
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
            return childNode.name === "part";
        }
    }
    exports.QuizContext = QuizContext;
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
const path2Link = script.getAttribute("data-path2") || "";
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
        "modules/lib/NodeTree",
        "modules/constants",
        "modules/utils",
    ], function (CerosSDK, PapaParse, QuizModule, NodeTreeModule, constants, utils) {
        CerosSDK.findExperience()
            .done((experience) => {
            const path1FieldsNodesDict = utils.stepsFromFieldNames(constants.path1Fields, constants.fieldNodesDict);
            const nodeTree = new NodeTreeModule.NodeTree(path1FieldsNodesDict);
            PapaParse.parse(link, {
                download: true,
                header: true,
                complete: (result) => {
                    nodeTree.buildTree(result.data, constants.path1Fields);
                    new QuizModule.QuizContext(CerosSDK, experience, nodeTree, distributor, relatedProductsLink, accessoriesLink, PapaParse, path2Link);
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

