(function ($) {
  "use strict";

  const $script = $("#dc-contactor");
  const link = $script.attr("data-link");
  const distributor = $script.attr("data-distributor") || "";

  // Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
  let absUrl;
  const srcAttribute = $script.attr("src");

  // Check that a src attibute was defined, and code hasn't been inlined by third party
  if (typeof srcAttribute !== "undefined" && new URL(srcAttribute)) {
    const srcURL = new URL(srcAttribute);
    const path = srcURL.pathname;
    const projectDirectory = path.split("/").slice(0, -1).join("/") + "/";
    absUrl = srcURL.origin + projectDirectory;
  } else {
    absUrl = "./";
  }

  // load CerosSDK via requirejs
  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
      PapaParse:
        "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min",
      modules: absUrl + "modules",
    },
  });

  require([
    "CerosSDK",
    "PapaParse",
    "modules/Node",
    "modules/NodeManager",
    "modules/NodeTree",
    "modules/LandingPageProxy",
    "modules/QuizContext",
  ], function (
    CerosSDK,
    PapaParse,
    Node,
    NodeManager,
    NodeTree,
    LandingPageProxy,
    QuizContext
  ) {
    // find experience to interact with
    CerosSDK.findExperience()
      .done(function (experience) {
        const navDict = {
          application: "Application: {{}}",
          "max-voltage": "Max Voltage: {{}}V",
          "current-rating": "Current: {{}}A",
          "coil-voltage": "Coil Voltage: {{}}V",
          mounting: "Mounting: {{}}",
          "aux-contacts": "Aux Contacts: {{}}",
          polarized: "Polarized: {{}}",
        };

        const keys = [
          "application",
          "max-voltage",
          "current-rating",
          "coil-voltage",
          "mounting",
          "aux-contacts",
          "polarized",
          "part",
        ];

        let clickTime = 0;

        const modules = {};

        //Initiate root node
        const root = new Node("Root");

        // Initiate NodeManager
        const nodeManager = new NodeManager();
        nodeManager.setCurrentNode(root);

        // Register the handlers on current node change
        nodeManager.addObserver(handleNodeChange);
        nodeManager.addObserver(updatePath);

        // Initiate NodeTree
        const nodeTree = new NodeTree(keys);

        // Initiate LandingPageProxy
        const landingPageProxy = new LandingPageProxy();

        const quizContext = new QuizContext(keys, nodeTree, nodeManager, root);

        /**
         * Check for mobile tag on mobile layout canvas
         */
        const isMobile =
          experience.findComponentsByTag("mobile").components.length;

        /**
         * Check for tablet tag on tablet layout canvas
         */
        const isTablet =
          experience.findComponentsByTag("tablet").components.length;

        const resetCollection = experience.findLayersByTag("reset");

        const backCollection = experience.findLayersByTag("back");

        const answerCollection = experience.findComponentsByTag("answer");

        const navCollections = experience.findComponentsByTag("nav");

        const pathCollection = experience.findComponentsByTag("path");

        /**
         * Parse the csv link passed through data attribute on the script. Pass the parsed result to NodeTree
         */
        PapaParse.parse(link, {
          download: true,
          header: true,
          complete: (result) => {
            nodeTree.buildTree(result.data, root);
          },
        });

        quizContext.setStrategiesBasedOnQuestionName();

        // handle back navigation
        backCollection.on(CerosSDK.EVENTS.CLICKED, handleBackNavigation);

        resetCollection.on(CerosSDK.EVENTS.CLICKED, () => {
          nodeManager.setCurrentNode(root);
        });

        /**
         *
         * @param { {action: string; data: Node } data
         */
        function handleNodeChange(data) {
          if (data.action === "currentNodeChanged") {
            if (
              data.node.name === "max-voltage" ||
              data.node.name === "current-rating"
            ) {
              const sortedNodes = data.node.children.sort(
                (a, b) => a.value - b.value
              );
              const evenOptions = experience.findLayersByTag(
                `${data.node.children[0].name}_even`
              );
              const oddOptions = experience.findLayersByTag(
                `${data.node.children[0].name}_odd`
              );

              if (isMobile || isTablet) {
                displayMobileLayoutOptions(
                  oddOptions,
                  evenOptions,
                  sortedNodes
                );
              } else {
                if (data.node.children.length % 2 === 0) {
                  oddOptions.hide();
                  evenOptions.show();
                  handleTextOptions(evenOptions, sortedNodes);
                } else {
                  oddOptions.show();
                  evenOptions.hide();
                  handleTextOptions(oddOptions, sortedNodes);
                }
              }
            } else if (data.node.name === "polarized") {
              showModule(data.node.children.length);
            } else {
              handleMasks(data.node);
            }
          }
        }

        function handleTextOptions(options, nodes) {
          const collection = options.layers[0].findAllComponents();

          const max = collection.layersByTag.answer.length;
          const first = Math.floor((max - nodes.length) / 2);
          let answerIndex = 0;

          collection.layers.forEach((layer, i) => {
            if (layer.type === "text") {
              if (answerIndex >= first && answerIndex - first < nodes.length) {
                layer.setText(nodes[answerIndex - first].value);
                nodes[answerIndex - first].elementId = layer.id;
              } else {
                layer.hide();
              }
              answerIndex++;
            } else if (layer.type === "line") {
              const position = !isNaN(layer.getPayload())
                ? Number(layer.getPayload())
                : null;
              if (position) {
                if (!(position > first && position - first < nodes.length)) {
                  layer.hide();
                  console.log(`line position - ${position}`);
                }
              } else {
                console.error(
                  `there is no position number in payload of divider line with id ${layer.id} in question ${nodes[0].name}`
                );
              }
            }
          });
        }

        function handleOneOptionInMobileView(nodes, collection) {
          let answerIndex = 0;
          collection.layers.forEach((layer) => {
            if (layer.type === "text") {
              if (answerIndex === 1) {
                layer.setText(nodes[0].value);
                nodes[0].elementId = layer.id;
              } else {
                layer.hide();
              }
              answerIndex++;
            } else {
              layer.hide();
            }
          });
        }

        function handleMobileTextOptions(options, nodes) {
          const collection = options.layers[0].findAllComponents();
          // const elements = collection.layersByTag.answer;
          let answerIndex = 0;
          if (nodes.length === 1) {
            handleOneOptionInMobileView(nodes, collection);
          } else {
            collection.layers.forEach((layer, i) => {
              if (layer.type === "text") {
                if (answerIndex < nodes.length) {
                  layer.setText(nodes[answerIndex].value);
                  nodes[answerIndex].elementId = layer.id;
                } else {
                  layer.hide();
                }
                answerIndex++;
              } else if (layer.type === "line") {
                const position = !isNaN(layer.getPayload())
                  ? Number(layer.getPayload())
                  : null;
                if (position) {
                  if (
                    position >= nodes.length ||
                    ((nodes.length === 4 || position.length === 5) &&
                      position > nodes.length - 2)
                  ) {
                    layer.hide();
                    console.log(`line position - ${position}`);
                  }
                } else {
                  console.error(
                    `there is no position number in payload of divider line with id ${layer.id} in question ${nodes[0].name}`
                  );
                }
              }
            });
          }
        }

        function displayMobileLayoutOptions(
          oddOptions,
          evenOptions,

          sortedNodes
        ) {
          if (sortedNodes.length % 2 === 0) {
            oddOptions.hide();
            evenOptions.show();

            handleMobileTextOptions(evenOptions, sortedNodes);
          } else {
            oddOptions.show();
            evenOptions.hide();

            handleMobileTextOptions(oddOptions, sortedNodes);
          }
        }

        answerCollection.on(
          CerosSDK.EVENTS.CLICKED,
          quizContext.onAnswerClick.bind(quizContext)
        );

        // answerCollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
        //   const tag = comp.getTags().find((tag) => tag.includes("q:"));
        //   const key = tag.split(":")[1];
        //   const parentNode = nodeManager.getCurrentNode();
        //   const options = { name: key };

        //   if (key === "current-rating" || key === "coil-voltage") {
        //     options.elementId = comp.id;
        //   } else {
        //     const val = comp.getPayload().trim();
        //     options.value = val;
        //   }
        //   const node = nodeTree.depthFirstSearch(parentNode, options);
        //   node
        //     ? nodeManager.setCurrentNode(node)
        //     : console.error(`coudn't find node with ${key} and value ${val}`);
        // });

        navCollections.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          const name = comp.getPayload().toLowerCase();
          let currentNode = nodeManager.getCurrentNode();
          let nodeFound = false;
          while (currentNode.parent && !nodeFound) {
            if (currentNode.name === name) {
              nodeFound = true;
            }
            currentNode = currentNode.parent;
          }
          nodeManager.setCurrentNode(currentNode);
        });

        let i = 0;
        while (i < 7) {
          const step = keys[i];
          const masks = experience.findLayersByTag(`mask:${step}`);
          masks.on(CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
            const payload = layer.getPayload();
            const foundChild = nodeManager
              .getCurrentNode()
              .children.find((node) => node.value === payload);
            if (foundChild) {
              layer.hide();
              console.log(`show layer ${payload}`);
            }
          });
          i++;
        }

        function updatePath(data) {
          let currentNode = data.node;
          const pathArray = [];

          while (currentNode.parent) {
            const template = navDict[currentNode.name];
            const value =
              currentNode.name === "polarized"
                ? getPolarizedValue(currentNode.value.toLowerCase())
                : capitalize(currentNode.value.split(" ").join(""));

            const text = template.replace("{{}}", value);
            pathArray.unshift(text);

            currentNode = currentNode.parent;
          }

          pathArray.length
            ? pathCollection.setText(pathArray.join("  >  "))
            : pathCollection.setText("");

          pathCollection.show();
        }

        function getPolarizedValue(str) {
          if (str.includes("no")) {
            return "No";
          } else {
            return "Yes";
          }
        }

        function handleModuleImage(img, data) {
          const tag = data["image"].split(".")[0].trim();
          if (tag.toLowerCase() === img.getPayload().toLowerCase()) {
            img.show();
          } else {
            img.hide();
          }
        }

        function handleModuleIcon(icon, data) {
          if (
            data["application"]
              .toLowerCase()
              .includes(icon.getPayload().toLowerCase())
          ) {
            icon.show();
          } else {
            icon.hide();
          }
        }

        function showResultImage(moduleTag, callback, imgArray) {
          imgArray.forEach((layer) => {
            layer.on(CerosSDK.EVENTS.ANIMATION_STARTED, (group) => {
              const type = moduleTag.split("-")[0];
              const obj = modules[type][moduleTag];
              const images = group.findAllComponents();
              images.layers.forEach((img) => callback(img, obj));
            });
          });
        }

        function updateResultTextbox(key, moduleTag, txtboxArray) {
          txtboxArray.forEach((layer) => {
            layer.on(CerosSDK.EVENTS.ANIMATION_STARTED, (txtBox) => {
              const type = moduleTag.split("-")[0];
              const obj = modules[type][moduleTag];
              txtBox.setText(obj[key]);
            });
          });
        }

        function registerResultClcikEvent(layerArray, key, moduleTag) {
          layerArray.forEach((layer) => {
            layer.on(CerosSDK.EVENTS.CLICKED, function () {
              const type = moduleTag.split("-")[0];
              const obj = modules[type][moduleTag];

              landingPageProxy.openAndTrackLink(obj[key], isDoubleClickBug);
            });
          });
        }

        function isDoubleClickBug() {
          if (Date.now() - clickTime < 200) {
            clickTime = Date.now();
            return true;
          } else {
            clickTime = Date.now();
            return false;
          }
        }

        function updateModuleResults(type) {
          nodeManager.getCurrentNode().children.forEach((node, index) => {
            const moduleTag =
              type > 1 ? `${type}-module-${index + 1}` : `${type}-module`;
            const module = experience.findLayersByTag(moduleTag);
            const collection = module.layers[0].findAllComponents();
            const layersDict = collection.layersByTag;

            const data = node.data;
            const size = type.toString();
            if (Object.hasOwn(modules, size) && modules[size][moduleTag]) {
              modules[size] = modules[size] || {};
              modules[size][moduleTag] = data;
            } else {
              modules[size] = modules[size] || {};
              modules[size][moduleTag] = data;

              layersDict.images &&
                showResultImage(
                  moduleTag,
                  handleModuleImage,
                  layersDict.images
                );

              layersDict.icons &&
                showResultImage(moduleTag, handleModuleIcon, layersDict.icons);

              layersDict.part &&
                updateResultTextbox("part", moduleTag, layersDict.part);

              layersDict.features &&
                updateResultTextbox("features", moduleTag, layersDict.features);

              layersDict.datasheet &&
                registerResultClcikEvent(
                  layersDict.datasheet,
                  "datasheet",
                  moduleTag
                );

              layersDict["buy-now"] &&
                registerResultClcikEvent(
                  layersDict["buy-now"],
                  distributor,
                  moduleTag
                );

              layersDict.specs &&
                updateResultTextbox("specs", moduleTag, layersDict.specs);
            }

            console.log(modules);
          });
        }

        function showModule(type) {
          updateModuleResults(type);

          const moduleResultHotspot = experience.findComponentsByTag(
            `module-${type}`
          );
          moduleResultHotspot.click();
        }

        function handleMasks(node) {
          const masksCollection = experience.findLayersByTag(
            `mask:${node.children[0].name}`
          );
          masksCollection.layers.forEach((layer) => {
            const val = layer.getPayload().toLowerCase();
            if (
              node.children.find((node) => node.value.toLowerCase() === val)
            ) {
              layer.hide();
            } else {
              layer.show();
            }
          });
        }

        function handleBackNavigation() {
          if (!isDoubleClickBug()) {
            nodeManager.setCurrentNode(nodeManager.getCurrentNode().parent);
          } else {
            console.log("detected double click");
          }
        }

        function capitalize(str) {
          return str[0].toUpperCase() + str.slice(1).toLowerCase();
        }
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
