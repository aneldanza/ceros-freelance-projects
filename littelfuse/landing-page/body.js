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
        const navCollection = experience.findComponentsByTag("nav");

        window.addEventListener("message", (event) => {
          if (typeof event.data === "string") {
            try {
              const data = JSON.parse(event.data);
              if (
                data.event &&
                data.event.indexOf(CUSTOM_EVENT_NAMESPACE) === 0
              ) {
                const event = data.event.split(":")[1];
                console.log(data);

                switch (event) {
                  case "page-nav":
                    handlePageNav(data.section);
                    break;

                  default:
                    break;
                }
              }
            } catch (e) {
              console.log(e);
            }
          }

          function handlePageNav(payload) {
            const hotspot = navCollection.components.find(
              (comp) => comp.getPayload() === payload
            );
            if (hotspot) {
              hotspot.click();
            }
          }
        });
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
