(function ($) {
  var scriptTag = document.getElementById("stornaway-video-plugin");

  // Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
  var absUrl = "./";
  var srcAttribute = scriptTag.getAttribute("src");

  // Check that a src attibute was defined, and code hasn't been inlined by third party
  if (srcAttribute) {
    if (new URL(srcAttribute)) {
      var srcURL = new URL(srcAttribute);
      var path = srcURL.pathname;
      var projectDirectory = path.split("/").slice(0, -1).join("/") + "/";
      absUrl = srcURL.origin + projectDirectory;
    }
  }

  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
    },
  });

  require(["CerosSDK"], function (CerosSDK) {
    CerosSDK.findExperience()
      .fail(function (error) {
        console.error(error);
      })
      .done(function (experience) {
        // find all video elements
        var videoCtaCollection = experience.findComponentsByTag("video-cta");

        // Detect if the platform is iOS
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        const requestFullscreen = (iframe) => {
          if (!isIOS) {
            const iframeParent = iframe.parentNode; // Wrapping iframe in a div helps on iOS

            if (iframeParent.requestFullscreen) {
              iframeParent.requestFullscreen(); // Chrome, Firefox, Safari
            } else if (iframeParent.webkitRequestFullscreen) {
              // Safari
              iframeParent.webkitRequestFullscreen();
            } else if (iframeParent.mozRequestFullScreen) {
              // Firefox
              iframeParent.mozRequestFullScreen();
            } else if (iframeParent.msRequestFullscreen) {
              // IE/Edge
              iframeParent.msRequestFullscreen();
            }
          } else {
            alert("playing on iOS");
          }
        };

        videoCtaCollection.on(CerosSDK.EVENTS.CLICKED, () => {
          const interval = setInterval(() => {
            const stornawayIframe = document.querySelector(
              'iframe[src*="stornaway.io"]'
            ); // Find the Stornaway iframe

            if (stornawayIframe && stornawayIframe.contentWindow) {
              clearInterval(interval);
              // Trigger fullscreen on user click event
              requestFullscreen(stornawayIframe);
            }
          }, 200);
        });
      });
  });
})(jQuery);
