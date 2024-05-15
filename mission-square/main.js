(function ($) {
  "use strict";

  const $script = $("#newsletter-menu");

  const link = $script.attr("data-link");

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
        const menuButton = experience.findComponentsByTag("menu");
        let disableParentScrolling = false;
        const pageContainers = $(".page-container");

        menuButton.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          if (comp.getPayload() == "open") {
            disableParentScrolling = true;
            pageContainers.css({ height: "3000px", overflow: "hidden" });
          } else {
            disableParentScrolling = false;
            pageContainers.css({ height: "100%", overflow: "auto" });
          }
        });
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
