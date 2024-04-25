(function ($) {
  "use strict";
  //   location.reload(true);

  const quizLogicLink =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfa2po3ZQvj_SMaaWULK2qegxJQjcvbkEB8AqpOvKNW6BKvFWRU2I6h5NzkQ_lBdc84Fw21yQtDe3G/pub?gid=980724681&single=true&output=csv&v=2";
  const googleSheetsLink =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvZU-RxSNkGfSwUcqASMkCAtHVjSvoJVMMDOR-KFt_vmPhdpnnWUUIGQVSWZWIIEe-Q_gTDCaFyo4s/pub?gid=980724681&single=true&output=csv";
  const $script = $("#v-series");
  // Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
  let absUrl;
  const srcAttribute = $script.attr("src");
  const link = $script.attr("data-link");
  const distributor = $script.attr("data-distributor") || "";
  const trackingId = $script.attr("data-tracking-id") || "";

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
        const products = {};
        const plainBracket = ["II", "III", "V", "XIV"];
        const raisedBracket = ["X", "XI", "XII"];
        const answers = {};
        const numOfQuestions = 4;
        const delimeter = "_";
        const results = {};
        let windowObjectReference = null; // global variable

        const resetCollection = experience.findLayersByTag("reset");
        const rockerImgCollection = experience.findComponentsByTag("rocker");
        const baseImgCollection = experience.findComponentsByTag("base");
        const rockerFolder = experience.findLayersByTag("rocker-img");
        const baseFolder = experience.findLayersByTag("base-img");
        const baseCTACollection = experience.findLayersByTag("base-cta");
        const rockerCTACollection = experience.findLayersByTag("rocker-cta");
        const baseNameCollection = experience.findComponentsByTag("base-name");
        const rockerNameCollection =
          experience.findComponentsByTag("rocker-name");
        const backCollection = experience.findLayersByTag("back");
        const descriptionCollection =
          experience.findComponentsByTag("description");

        const dict = {
          type: "",
          switch: "",
          number: "",
          lamps: "",
        };

        PapaParse.parse(quizLogicLink, {
          download: true,
          header: true,
          complete: (result) => {
            console.log(result.data);
            filterProducts(result.data);
            console.log("unique products");
            console.log("-----------------");
            console.log(
              "length of unique list is " + Object.keys(products).length
            );
            console.log(products);
            if (distributor) {
              trackHotspots();
            }
          },
        });

        // send UA event with outbound link info
        //   function sendUAEvent(link) {

        //     if (window.self !== window.top) {
        //       const data = {
        //         event_category: "CEROS",
        //         event_label: link,
        //         event_action: "outbound_link_click",
        //         tracking_id: trackingId
        //       };
        //       parent.postMessage(JSON.stringify(data), "*");
        //     } else {
        //       gtag("event", "ceros-click", {
        //         event_category: "CEROS",
        //         event_label: link,
        //         transport_type: "beacon",
        //         event_callback: function () {
        //           console.log("event is succeessfully sent");
        //           openRequestedSingleTab(link);
        //         },
        //       });
        //     }

        // dataLayer.push({
        //   event: "outbound-link-click",
        //   eventCategory: "CEROS",
        //   eventAction: "ceros-click",
        //   eventLabel: link,
        // });
        //   }

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

              setProductName("base", baseNameCollection.components[0]);
              setProductName("rocker", rockerNameCollection.components[0]);

              updateResultDescription(descriptionCollection.components[0]);
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
            if (products[item]["product_tag"].toLowerCase() === productKey.toLowerCase()) {
              results[`${product}Name`] = item;
              results[`${product}ImageTag`] = products[item]["img_tag"] 
              results[`${product}Link`] = products[item][distributor];
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

        // show Rocker imagerockerFolder
        rockerFolder.on(CerosSDK.EVENTS.ANIMATION_STARTED, () => {
          const rockerImgPayload = `${answers["q-1"]}${delimeter}${answers["q-2"]}`;
          showResultImage(rockerImgPayload, rockerImgCollection);
        });

        // show Base image
        baseFolder.on(CerosSDK.EVENTS.ANIMATION_STARTED, () => {
          const baseType = findBaseType(answers["q-1"]);
          const baseImgPayload = answers["q-3"]
            ? `${baseType}${delimeter}${answers["q-2"]}${delimeter}${answers["q-3"]}`
            : `${baseType}${delimeter}${answers["q-2"]}`;
          showResultImage(baseImgPayload, baseImgCollection);
        });

        function showResultImage(payload, imageCollection) {
        //   const foundImg = imageCollection.components.find(
        //     (img) =>
        //       img.getPayload().toLowerCase() === payload.toLocaleLowerCase()
        //   );
        //   foundImg && foundImg.show();

          imageCollection.components.forEach(img => {
            if (img.getPayload().toLowerCase() === payload.toLocaleLowerCase()) {
                img.show()
            } else {
                img.hide()
            }
          })
        }

        // trigger base CTA
        baseCTACollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          openRequestedSingleTab(results.baseLink);
          // sendUAEvent(results.baseLink);
        });

        // trigger rocker CTA
        rockerCTACollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          openRequestedSingleTab(results.rockerLink);
          // sendUAEvent(results.rockerLink);
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

        function filterProducts(data) {
          data.forEach((obj) => {
            if (!(obj.product in products)) {
              products[obj.product] = {};
              for (const key in obj) {
                products[obj.product][key] = obj[key];
              }
            }
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
