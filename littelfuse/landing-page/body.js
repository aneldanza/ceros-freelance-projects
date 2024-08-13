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
        window.addEventListener("message", (event) => {
          if (typeof event.data === "string") {
            try {
              const data = JSON.parse(event.data);
              if (data.name === "page-header") {
                console.log(data);
              }
            } catch (e) {
              console.log(e);
            }
          }
        });
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
