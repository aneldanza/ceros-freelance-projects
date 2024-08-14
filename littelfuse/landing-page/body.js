(function ($) {
  "use strict";

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
              if (data.name === "page-header") {
                console.log(data);

                switch (data.payload.type) {
                  case "page-nav":
                    handlePageNav(data.payload.section);
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
