(function ($) {
  "use strict";

  const $script = $("#dc-contactor");
  const link = $script.attr("data-link");
  const distributor = $script.attr("data-distributor") || "";

  // load CerosSDK via requirejs
  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
      PapaParse:
        "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min",
    },
  });

  require(["CerosSDK", "PapaParse"], function (CerosSDK, PapaParse) {
    // find experience to interact with
    CerosSDK.findExperience()
      .done(function (experience) {
        class Node {
          constructor(name, value = "", parent = null) {
            this.name = name;
            this.value = value;
            this.children = [];
            this.data = {};
            this.parent = parent;
          }
        }

        let clickTime = 0;
        let windowObjectReference = null; // global variable
        const modules = {};
        const root = new Node("Root");
        let nextNode = root;

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

        const navDict = {
          application: "Application: {{}}",
          "max-voltage": "Max Voltage: {{}}V",
          "current-rating": "Current: {{}}A",
          "coil-voltage": "Coil Voltage: {{}}V",
          mounting: "Mounting: {{}}",
          "aux-contacts": "Aux Contacts: {{}}",
          polarized: "Polarized: {{}}",
        };

        const isPreview =
          window.self == window.top &&
          window.location.hostname.includes(".preview.ceros");

        const resetCollection = experience.findLayersByTag("reset");

        const backCollection = experience.findLayersByTag("back");

        const resultsCollection = experience.findLayersByTag("results");

        const answerCollection = experience.findComponentsByTag("answer");

        const navCollections = experience.findComponentsByTag("nav");

        const pathCollection = experience.findComponentsByTag("path");

        updatePath();

        PapaParse.parse(link, {
          download: true,
          header: true,
          complete: (result) => {
            filterProducts(result.data);
            console.log(root);
          },
        });

        // handle back navigation
        backCollection.on(CerosSDK.EVENTS.CLICKED, handleBackNavigation);

        resetCollection.on(CerosSDK.EVENTS.CLICKED, () => {
          nextNode = root;
          updatePath();
          console.log(nextNode);
        });

        resultsCollection.on(CerosSDK.EVENTS.ANIMATION_STARTED, () => {
          if (nextNode.children.length === 3) {
            const threeModuleResult = experience.findLayersByTag(`module-3`);
            threeModuleResult.click();
          }
        });

        answerCollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          const tag = comp.getTags().find((tag) => tag.includes("q:"));
          const key = tag.split(":")[1];
          const val = comp.getPayload().trim();
          nextNode = depthFirstSearch(nextNode, val, key);
          console.log(nextNode);
          handleMasks(nextNode);
          updatePath();

          if (key === "polarized") {
            showModule(nextNode.children.length);
          }
        });

        navCollections.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          const name = comp.getPayload().toLowerCase();
          let currentNode = nextNode;
          let nodeFound = false;
          while (currentNode.parent && !nodeFound) {
            if (currentNode.name === name) {
              nodeFound = true;
            }
            currentNode = currentNode.parent;
          }
          nextNode = currentNode;
          handleMasks(nextNode);
          updatePath();
          console.log(nextNode);
        });

        let i = 0;
        while (i < 7) {
          const step = keys[i];
          const masks = experience.findLayersByTag(`mask:${step}`);
          masks.on(CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
            const payload = layer.getPayload();
            const foundChild = nextNode.children.find(
              (node) => node.value === payload
            );
            if (foundChild) {
              layer.hide();
              console.log(`show layer ${payload}`);
            }
          });
          i++;
        }

        masksCollection.on(CerosSDK.EVENTS.ANIMATION_STARTED, (layer) => {
          const payload = layer.getPayload();
          if (nextNode.children.find((node) => node.value === payload)) {
            layer.show();
          } else {
            layer.hide();
          }
        });

        function updatePath() {
          let currentNode = nextNode;
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

              openAndTrackLink(obj[key]);
            });
          });
        }

        function openAndTrackLink(url) {
          if (!isDoubleClickBug()) {
            if (isPreview) {
              openRequestedSingleTab(url);
            } else {
              sendUAEvent(url);
            }
          }
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
          nextNode.children.forEach((node, index) => {
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

        function depthFirstSearch(node, targetValue, targetName) {
          if (
            node.value.toLowerCase() === targetValue.toLowerCase() &&
            node.name.toLowerCase() === targetName.toLowerCase()
          ) {
            return node;
          }

          for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            let result = depthFirstSearch(child, targetValue, targetName);

            if (result !== null) {
              return result;
            }
          }

          return null;
        }

        function handleNewNode(val, name, parent, obj = {}) {
          const foundNode = parent.children.find((node) => node.value === val);
          if (!foundNode) {
            const node = new Node(name, val, parent);
            node.data = obj;
            parent.children.push(node);
            return node;
          } else {
            return foundNode;
          }
        }

        function addPath(node, obj) {
          let parent = node;
          for (let i = 1; i < keys.length; i++) {
            const key = keys[i];
            const val = obj[key].trim();
            if (key === "part") {
              parent = handleNewNode(val, key, parent, obj);
            } else {
              parent = handleNewNode(val, key, parent);
            }
          }
        }

        function filterProducts(data) {
          data.forEach((obj) => {
            const apps = obj[keys[0]].split("_");
            apps.forEach((app) => {
              const key = keys[0];
              const value = app.trim().toLowerCase();
              const node = handleNewNode(value, key, root);
              addPath(node, obj);
            });
          });
        }

        // send UA event with outbound link info
        function sendUAEvent(link) {
          if (window.self !== window.top) {
            const data = {
              event_category: "CEROS",
              event_label: link,
              event_action: "outbound_link_click",
            };
            parent.postMessage(JSON.stringify(data), "*");
          } else {
            dataLayer.push({
              event: "ceros-event",
              cerosAction: "ceros_outbound_link_click",
              cerosCategory: "CEROS",
              cerosLabel: link,
            });
            openRequestedSingleTab(link);
          }
        }

        function handleBackNavigation() {
          if (!isDoubleClickBug()) {
            nextNode = nextNode.parent;
            handleMasks(nextNode);
            updatePath();
            console.log(nextNode);
          } else {
            console.log("detected double click");
          }
        }

        function openRequestedSingleTab(url) {
          if (windowObjectReference === null || windowObjectReference.closed) {
            windowObjectReference = window.open(url, "_blank");
          } else {
            windowObjectReference = window.open(url, "_blank");
            windowObjectReference.focus();
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
