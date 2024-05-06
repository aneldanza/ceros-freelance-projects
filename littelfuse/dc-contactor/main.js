(function ($) {
  "use strict";

  const logicLink =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQsDn45xzDyGCrvetblyWrJF0Y69V_FA89qhMv307i_i9lnmYmA-t5mADY4vrEr6kMWeHBrA445N8QO/pub?gid=0&single=true&output=csv";

  const $script = $("#dc-contactor");
  // Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
  let absUrl;
  const srcAttribute = $script.attr("src");
  const link = $script.attr("data-link");
  const distributor = $script.attr("distributor") || "";

  // Check that a src attibute was defined, and code hasn't been inlined by third party
  if (typeof srcAttribute !== "undefined") {
    var path = srcAttribute.split("?")[0];
    absUrl = path.split("/").slice(0, -1).join("/") + "/";
  } else {
    absUrl = "./";
  }

  // load CerosSDK via requirejs
  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
      PapaParse:
        "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min",
    },
  });

  require(["CerosSDK", "PapaParse"], function (CerosSDK, PapaParse) {
    // export const quizConfig = config;

    // find experience to interact with
    CerosSDK.findExperience()
      .done(function (experience) {
        let rawData = {};
        let clickTime = 0;
        let windowObjectReference = null; // global variable
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
          application: "{{}} Application",
          "max-voltage": "Max Voltage {{}}V",
          "current-rating": "Current {{}}A",
          "coil-voltage": "Coil Voltage {{}}V",
          mounting: "{{}} Mount",
          "aux-contacts": "{{}} Aux Contacts",
          "polarized": "{{}}"
        };

        const isPreview =
          window.self == window.top &&
          window.location.hostname.includes(".preview.ceros");

        const resetCollection = experience.findLayersByTag("reset");

        const backCollection = experience.findLayersByTag("back");

        const resultsCollection = experience.findLayersByTag("results");

        const answerCollection = experience.findComponentsByTag("answer");

        const navCollections = experience.findComponentsByTag("nav");

        PapaParse.parse(link, {
          download: true,
          header: true,
          complete: (result) => {
            rawData = result.data;
            console.log(result.data);
            filterProducts(result.data);
            console.log(root);
          },
        });

        // handle back navigation
        backCollection.on(CerosSDK.EVENTS.CLICKED, handleBackNavigation);

        resetCollection.on(CerosSDK.EVENTS.CLICKED, () => {
          nextNode = root;
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
          updateNavigation(nextNode);
          if (key === "polarized") {
            showModule(nextNode.children.length);
          }
        });

        function updateNavigation(nextNode) {
          let currentNode = nextNode;

          while (currentNode.parent) {
            const components = navCollections.components.filter((comp) => {
              return currentNode.name === comp.getPayload().toLowerCase();
            });

            components.forEach((comp) => {
              const template = navDict[currentNode.name];
              const value =
                currentNode.name === "aux-contacts" &&
                currentNode.value.toLowerCase() === "yes"
                  ? ""
                  : capitalize(currentNode.value.split(" ").join(""));
              const text = template.replace("{{}}", value);
              comp.setText(text);
            });
            currentNode = currentNode.parent;
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

        function showResultImage(data, callback, imgArray) {
          imgArray.forEach((layer) => {
            layer.on(CerosSDK.EVENTS.ANIMATION_STARTED, (group) => {
              const images = group.findAllComponents();
              images.layers.forEach((img) => callback(img, data));
            });
          });
        }

        function updateResultTextbox(key, data, txtboxArray) {
          txtboxArray.forEach((layer) => {
            layer.on(CerosSDK.EVENTS.ANIMATION_STARTED, (txtBox) =>
              txtBox.setText(data[key])
            );
          });
        }

        function registerResultClcikEvent(layerArray, key, data) {
          layerArray.forEach((layer) => {
            layer.on(CerosSDK.EVENTS.CLICKED, () => {
              openAndTrackLink(data[key]);
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

            layersDict.images &&
              showResultImage(data, handleModuleImage, layersDict.images);

            layersDict.icons &&
              showResultImage(data, handleModuleIcon, layersDict.icons);

            layersDict.part &&
              updateResultTextbox("part", data, layersDict.part);

            layersDict.features &&
              updateResultTextbox("features", data, layersDict.features);

            layersDict.datasheet &&
              registerResultClcikEvent(layersDict.datasheet, "datasheet", data);

            layersDict["buy-now"] &&
              registerResultClcikEvent(
                layersDict["buy-now"],
                distributor,
                data
              );
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

        function Node(name, value = "", parent = null) {
          this.name = name;
          this.value = value;
          this.children = [];
          this.data = {};
          this.parent = parent;
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
          }
        }

        function handleBackNavigation() {
          if (!isDoubleClickBug()) {
            nextNode = nextNode.parent;
            handleMasks(nextNode);
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
