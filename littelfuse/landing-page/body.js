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

        const sectionTtitleCollection = experience.findComponentsByTag("title");

        const targetAreaCollection =
          experience.findComponentsByTag("target-area");

        const pageContainer = document.querySelector(".page-container");

        const getHTMLElement = (layer) => {
          return document.getElementById(layer.id);
        };

        const sendEvent = (eventType, data) => {
          const eventData = { event: eventType, ...data };
          const payload = JSON.stringify(eventData);
          window.parent.postMessage(payload, "*");
        };

        pageContainer.addEventListener("scroll", () => {
          // console.log("scrolling page container");
          sectionTtitleCollection.components.forEach((sectionTitle) => {
            const sectionTitleElement = getHTMLElement(sectionTitle);
            const sectionTitleRect =
              sectionTitleElement.getBoundingClientRect();

            const area = targetAreaCollection.components[0];
            if (area && getHTMLElement(area)) {
              const areaRect = getHTMLElement(area).getBoundingClientRect();
              if (
                sectionTitleRect.top >= areaRect.top &&
                sectionTitleRect.bottom <= areaRect.bottom
              ) {
                // Section title is in view
                // console.log(sectionTitle.getPayload());
                sendEvent(CUSTOM_EVENT_NAMESPACE + "view", {
                  payload: sectionTitle.getPayload(),
                });
              }
            } else {
              console.log("No target area found");
            }
          });
        });
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
