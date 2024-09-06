(function ($) {
  "use strict";

  var EVENT_NAMESPACE = "ceros-embedded-viewport:";
  const CUSTOM_EVENT_NAMESPACE = "custom-ceros-embedded-viewport:";

  // load CerosSDK via requirejs
  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
    },
  });

  require(["CerosSDK"], function (CerosSDK) {
    // find experience to interact with
    CerosSDK.findExperience()
      .done(function (experience) {
        window.experience = experience;
        let initialPositionData = {};
        const sectionTops = {};

        const sectionTtitleCollection = experience.findComponentsByTag("title");

        // const targetAreaCollection =
        //   experience.findComponentsByTag("target-area");

        // const pageContainer = document.querySelector(".page-container");

        const isSectionInTopHalf = (positionData, layer) => {
          const section = getHTMLElement(layer);

          if (section) {
            var sectionRect = section.getBoundingClientRect();

            // Calculate the section's top and bottom positions relative to the viewport
            var sectionTop = sectionRect.top - positionData.top; // Top position of the section in the parent page
            var sectionBottom = sectionRect.bottom - positionData.top; // Bottom position of the section in the parent page

            // Calculate the midpoint of the viewport in the parent page
            var viewportMidpoint = positionData.windowHeight / 2;

            sectionTops[layer.getPayload()] = sectionTop;

            // Check if the section's top is above the viewport midpoint and bottom is below the viewport top
            return sectionTop < viewportMidpoint && sectionBottom > 0;
          }
        };

        const checkAndUpdateNavigation = (data) => {
          sectionTtitleCollection.components.forEach((sectionTitle) => {
            if (isSectionInTopHalf(data, sectionTitle)) {
              sendEvent(CUSTOM_EVENT_NAMESPACE + "view", {
                payload: sectionTitle.getPayload(),
              });
            }
          });
        };

        function throttle(func, limit) {
          let lastFunc;
          let lastRan;
          return function () {
            const context = this;
            const args = arguments;
            if (!lastRan) {
              func.apply(context, args);
              lastRan = Date.now();
            } else {
              clearTimeout(lastFunc);
              lastFunc = setTimeout(function () {
                if (Date.now() - lastRan >= limit) {
                  func.apply(context, args);
                  lastRan = Date.now();
                }
              }, limit - (Date.now() - lastRan));
            }
          };
        }

        // Use throttled function for checking view
        const throttledCheckView = throttle(checkAndUpdateNavigation, 100); // adjust the limit (ms) to your preference

        const dispatchEvent = (eventType, sourceWindow, data) => {
          switch (eventType) {
            case "position":
              console.log("position event received");
              console.log(data);

              throttledCheckView(data);
              break;

            default:
              break;
          }
        };

        window.addEventListener("message", (message) => {
          try {
            const data = JSON.parse(message.data);
            if (data && data.event) {
              const length = data.event.startsWith(EVENT_NAMESPACE)
                ? EVENT_NAMESPACE.length
                : data.event.startsWith(CUSTOM_EVENT_NAMESPACE)
                ? CUSTOM_EVENT_NAMESPACE.length
                : 0;
              if (length) {
                dispatchEvent(data.event.substr(length), message.source, data);
              }
            }
          } catch (e) {
            // ignore messages that are not JSON or are from different libraries
          }
        });

        const getHTMLElement = (layer) => {
          return document.getElementById(layer.id);
        };

        const sendEvent = (eventType, data) => {
          const eventData = { event: eventType, ...data };
          const payload = JSON.stringify(eventData);
          window.parent.postMessage(payload, "*");
        };

        // pageContainer.addEventListener("scroll", () => {
        //   // console.log("scrolling page container");
        //   sectionTtitleCollection.components.forEach((sectionTitle) => {
        //     const sectionTitleElement = getHTMLElement(sectionTitle);
        //     const sectionTitleRect =
        //       sectionTitleElement.getBoundingClientRect();

        //     const area = targetAreaCollection.components[0];
        //     if (area && getHTMLElement(area)) {
        //       const areaRect = getHTMLElement(area).getBoundingClientRect();
        //       if (
        //         sectionTitleRect.top >= areaRect.top &&
        //         sectionTitleRect.bottom <= areaRect.bottom
        //       ) {
        //         // Section title is in view
        //         // console.log(sectionTitle.getPayload());
        //         sendEvent(CUSTOM_EVENT_NAMESPACE + "view", {
        //           payload: sectionTitle.getPayload(),
        //         });
        //       }
        //     } else {
        //       console.log("No target area found");
        //     }
        //   });
        // });
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
