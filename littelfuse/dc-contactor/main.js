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

        answerCollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          const tag = comp.getTags().find((tag) => tag.includes("q:"));
          const key = tag.split(":")[1];
          const val = comp.getPayload().trim();
          nextNode = depthFirstSearch(nextNode, val, key);
          console.log(nextNode);
          handleMasks(nextNode);
        });

        function handleMasks(node) {
          const masksCollection = experience.findLayersByTag(
            `mask:${node.children[0].name}`
          );
          masksCollection.layers.forEach((layer) => {
            const val = layer.getPayload().toLowerCase();
            if (node.children.find((node) => node.value.toLowerCase() === val)) {
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
          // ga('send', 'event', "CEROS", "outbound-link", link);

          //   ga('send', 'event', {
          //     'eventCategory': 'CEROS',
          //     'eventAction': 'outbound-link-click',
          //     'eventLabel': link,
          //     'transport': 'beacon'
          // });

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

        // track user answers
        let i = 1;
        while (i <= numOfQuestions) {
          const qNum = `q-${i}`;
          const questionAnswersCollection = experience.findLayersByTag(qNum);
          questionAnswersCollection.on(CerosSDK.EVENTS.CLICKED, (hotspot) => {
            answers[qNum] = hotspot.getPayload();
            console.log(answers);
            updateDict(qNum);
            if (qNum === "q-2") {
              handleQ2(hotspot);
            }
            if (qNum === `q-${numOfQuestions}`) {
              findResults();
              resultsCollection.show();
            }
          });
          i++;
        }

        function handleQ2(hotspot) {
          const h = backCollection.layers.find((comp) =>
            comp.getTags().includes("3")
          );
          if (h && hotspot.getPayload() === "No") {
            h.hide();
          } else {
            h.show();
          }
        }

        // find results
        function findResults() {
          const baseType = findBaseType(answers["q-1"]);
          const baseKey = answers["q-3"]
            ? `${baseType}${delimeter}${answers["q-2"]}${delimeter}${answers["q-3"]}${delimeter}${answers["q-4"]}`
            : `${baseType}${delimeter}${answers["q-2"]}${delimeter}${answers["q-4"]}`;
          console.log(baseKey);
          const rockerKey = `${answers["q-1"]}${delimeter}${answers["q-2"]}`;
          storeProductResults(baseKey, "base");
          storeProductResults(rockerKey, "rocker");
        }

        function storeProductResults(productKey, product) {
          for (const item in products) {
            if (products[item].key.toLowerCase() === productKey.toLowerCase()) {
              results[`${product}Name`] = item;
              results[`${product}Link`] = products[item][distributor];
              product === "base"
                ? baseNameCollection.components.forEach((comp) =>
                    comp.setText(results.baseName)
                  )
                : rockerNameCollection.components.forEach((comp) =>
                    comp.setText(results.rockerName)
                  );
              console.log(results);
            }
          }
        }

        // reset user answers
        resetCollection.on(CerosSDK.EVENTS.CLICKED, () => {
          for (const q in answers) {
            answers[q] = "";
          }

          for (const key in dict) {
            dict[key] = "";
          }

          for (const r in results) {
            results[r] = "";
          }
        });

        // handle back navigation
        backCollection.on(CerosSDK.EVENTS.CLICKED, handleBackNavigation);

        function findBaseType(key) {
          if (plainBracket.includes(key.toUpperCase())) {
            return "Plain";
          } else if (raisedBracket.includes(key.toUpperCase())) {
            return "Raised";
          } else {
            throw Error("couldn't find bracket type for Contura " + key);
          }
        }

        // trigger base CTA
        baseCTACollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          openRequestedSingleTab(results.baseLink);
          sendUAEvent(results.baseLink);
        });

        // trigger rocker CTA
        rockerCTACollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          openRequestedSingleTab(results.rockerLink);
          sendUAEvent(results.rockerLink);
        });

        // show base name
        baseNameCollection.on(CerosSDK.EVENTS.ANIMATION_STARTED, (comp) => {
          setProductName("base", comp);
        });

        // show rocker name
        rockerNameCollection.on(CerosSDK.EVENTS.ANIMATION_STARTED, (comp) => {
          setProductName("rocker", comp);
        });

        function setProductName(product, comp) {
          const productName = `${product}Name`;
          if (results[productName]) {
            comp.setText(results[productName].toUpperCase());
          } else {
            findResults();
            comp.setText(results[productName].toUpperCase());
          }
        }

        function trackHotspots() {
          const productNames = Object.keys(products);
          productNames.forEach((product) => {
            const productHotspotCollection = experience.findComponentsByTag(
              product.toLowerCase()
            );
            productHotspotCollection.on(CerosSDK.EVENTS.CLICKED, () => {
              const link = products[product][distributor];
              openRequestedSingleTab(link);
            });
          });
        }

        function goToQ2() {
          const type = answers["q-1"];
          const q1Options = experience.findComponentsByTag("q-1");
          const selected = q1Options.components.find(
            (component) =>
              component.getPayload().toUpperCase() == type.toUpperCase()
          );
          selected.click();
        }

        function handleBackNavigation(comp) {
          const qNum = comp.getPayload();

          switch (qNum) {
            case "3":
              goToQ2();
              break;
            case "4":
              if (answers["q-3"]) {
                const q3Folder = experience.findLayersByTag("q3-folder");
                q3Folder.show();
              } else {
                goToQ2();
              }
            default:
              break;
          }
        }

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
