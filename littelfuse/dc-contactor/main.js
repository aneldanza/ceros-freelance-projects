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
        const products = {};
        const answers = {};
        const numOfQuestions = 7;
        const delimeter = "_";
        const results = {};
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

        const resetCollection = experience.findLayersByTag("reset");

        const backCollection = experience.findLayersByTag("back");

        const resultsCollection = experience.findLayersByTag("results");

        const answerCollection = experience.findComponentsByTag("answer");

        const root = new Node("Root");
        let nextNode = root;

        PapaParse.parse(link, {
          download: true,
          header: true,
          complete: (result) => {
            rawData = result.data;
            console.log(result.data);
            filterProducts(result.data);
            console.log(root);
            if (distributor) {
              trackHotspots();
            }
          },
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
          if (key === "polarized") {
            showModule(nextNode.children.length);
          }
        });

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

        function showModule(type) {
          nextNode.children.forEach((node, index) => {
            const moduleTag =
              type > 1 ? `${type}-module-${index + 1}` : `${type}-module`;
            const module = experience.findLayersByTag(moduleTag);
            const collection = module.layers[0].findAllComponents();
            const layersDict = collection.layersByTag;

            const data = node.data;

            layersDict.images &&
              layersDict.images.forEach((layer) => {
                layer.on(CerosSDK.EVENTS.ANIMATION_STARTED, (group) => {
                  const images = group.findAllComponents();
                  images.layers.forEach((img) => handleModuleImage(img, data));
                });
              });

            layersDict.icons &&
              layersDict.icons.forEach((layer) => {
                layer.on(CerosSDK.EVENTS.ANIMATION_STARTED, (group) => {
                  const icons = group.findAllComponents();
                  icons.layers.forEach((icon) => handleModuleIcon(icon, data));
                });
              });

            layersDict.part &&
              layersDict.part.forEach((layer) => {
                layer.on(CerosSDK.EVENTS.ANIMATION_STARTED, (partNumber) =>
                  partNumber.setText(data["part"])
                );
              });

            layersDict.features &&
              layersDict.features.forEach((layer) => {
                layer.on(CerosSDK.EVENTS.ANIMATION_STARTED, (feature) => {
                  feature.setText(data["features"]);
                });
              });
          });

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

        function Node(name, value = "") {
          this.name = name;
          this.value = value;
          this.children = [];
          this.data = {};
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
            const node = new Node(name, val);
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
          dataLayer.push({
            event: "outbound-link-click",
            eventCategory: "CEROS",
            eventAction: "ceros-click",
            eventLabel: link,
          });
        }

        // update description
        function updateResultDescription(comp) {
          const text = `Contura ${dict.type}, Black, ${dict.number} Lens, SP, ${dict.switch}, 20A 12V, 250 TAB (QC), ${dict.lamps}`;
          comp.setText(text);
        }

        function updateDict(qNum) {
          switch (qNum) {
            case "q-1":
              dict.type = answers[qNum].toUpperCase();
              break;
            case "q-2":
              dict.number = capitalize(answers[qNum]);
              if (dict.number === "No") {
                dict.lamps = "No Lamps";
              }
              break;
            case "q-3":
              dict.lamps = `${dict.number} ${capitalize(answers[qNum])} ${
                dict.number === "One" ? "Lamp" : "Lamps"
              }`;
            case "q-4":
              dict.switch = answers[qNum].toUpperCase();
            default:
              break;
          }
        }

        function capitalize(str) {
          return str[0].toUpperCase() + str.slice(1).toLowerCase();
        }

        descriptionCollection.on(
          CerosSDK.EVENTS.ANIMATION_STARTED,
          updateResultDescription
        );

        // handle back navigation
        backCollection.on(CerosSDK.EVENTS.CLICKED, handleBackNavigation);

        let windowObjectReference = null; // global variable

        function openRequestedSingleTab(url) {
          if (windowObjectReference === null || windowObjectReference.closed) {
            windowObjectReference = window.open(url, "_blank");
          } else {
            windowObjectReference = window.open(url, "_blank");
            windowObjectReference.focus();
          }
        }
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
