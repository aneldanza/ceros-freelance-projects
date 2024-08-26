(function ($) {
  "use strict";

  // Only run this at runtime
  if (typeof require !== "undefined") {
    // load CerosSDK via requirejs
    require.config({
      paths: {
        CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
      },
    });
  }

  require(["CerosSDK"], function (CerosSDK) {
    // find experience to interact with
    CerosSDK.findExperience()
      .done(function (experience) {})
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
