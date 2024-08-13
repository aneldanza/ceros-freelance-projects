(function ($) {
  "use strict";

  // load CerosSDK via requirejs
  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
    },
  });

  require(["CerosSDK", "PapaParse"], function (CerosSDK, PapaParse) {
    // find experience to interact with
    CerosSDK.findExperience()
      .done(function (experience) {})
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
