(function ($) {
  var scriptTag = document.getElementById("ceros-video-plugin");

  // Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
  var absUrl,
    srcAttribute = scriptTag.getAttribute("src");

  // Check that a src attibute was defined, and code hasn't been inlined by third party
  if (typeof srcAttribute !== "undefined" && new URL(srcAttribute)) {
    var srcURL = new URL(srcAttribute);
    var path = srcURL.pathname;
    var projectDirectory = path.split("/").slice(0, -1).join("/") + "/";
    var absUrl = srcURL.origin + projectDirectory;
  } else {
    absUrl = "./";
  }

  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
      modules: absUrl + "modules",
    },
  });

  require(["CerosSDK", "modules/videoController", "modules/eventHandler"], function (CerosSDK, videoController, EventHandler) {
    CerosSDK.findExperience()
      .fail(function (error) {
        console.error(error);
      })
      .done(function (experience) {
        // find all video elements
        var videoCollection = experience.findComponentsByTag("video");

        // find all hotspots over video control buttons
        var videoControlsCollection = experience.findComponentsByTag("video-control");

        var vc,
          DEBUGGER_PARAM_KEY = "ceros-debug";

        videoControlsCollection.on(CerosSDK.EVENTS.CLICKED, dispatchEvent);

        experience.on(CerosSDK.EVENTS.PAGE_CHANGED, setVideoController);

        /**
         * trigger event on video control button click
         * @param {CerosComponent} comp
         */
        function dispatchEvent(comp) {
          vc.dispatchEvent(comp);
        }

        /**
         * on page change event, create video controller instance if it does not exist yet
         * @param {CerosPage} page
         */
        function setVideoController(page) {
          vc = vc || new videoController(videoCollection, page.experience, EventHandler);

          if (isDebuggerMode()) {
            logVideoControllerConfig();
          }
        }

        /**
         * Check for DEBUGGER_PARAM_KEY in window URL
         * This will only work in standalone version!!
         */
        function isDebuggerMode() {
          var searchParams = new URLSearchParams(location.search);
          if (searchParams.has(DEBUGGER_PARAM_KEY)) {
            return true;
          }
        }

        function logVideoControllerConfig() {
          console.log(vc);
        }
      });
  });
})(jQuery);
