(function ($) {
  "use strict";

  const $script = $("#newsletter-menu");

  const link = $script.attr("data-link");

  // load CerosSDK via requirejs
  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
      lodash:
        "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min",
    },
  });

  require(["CerosSDK", "lodash"], function (CerosSDK, _) {
    // find experience to interact with
    CerosSDK.findExperience()
      .done(function (experience) {
        console.log(_);
        const menuButton = experience.findComponentsByTag("menu");
        let disableParentScrolling = false;
        const pageContainers = $(".page-container");
        const zoomControls = document.getElementsByClassName("zoom-controls");

        const config = { attributes: true };

        const callback = (mutationList, observer) => {
          for (const mutation of mutationList) {
          if (mutation.type === "attributes" && mutation.attributeName === "style") {
              console.log(
                `The ${mutation.attributeName} attribute was modified.`
              );
              monitoredScrollingVariable.value = monitoredScrollingVariable.value;
            }
          }
        };

        const observer = new MutationObserver(callback);

        for (let i = 0; i < zoomControls.length; i++) {
          const zoomControl = zoomControls[i];
          observer.observe(zoomControl, config);
        }

        const scrollingHandler = {
          set(target, property, value) {
            console.log(
              `Variable "${property}" changed from ${target[property]} to ${value}`
            );
            target[property] = value;
            if (value) {
              disableScrolling();
            } else {
              enableScrolling();
            }
          },
        };

        const monitoredScrollingVariable = new Proxy(
          { value: disableParentScrolling },
          scrollingHandler
        );

        function disableScrolling() {
          //   disableParentScrolling = true;
          pageContainers.css({ height: "3000px", overflow: "hidden" });
        }

        function enableScrolling() {
          //   disableParentScrolling = false;
          pageContainers.css({ height: "100%", overflow: "auto" });
        }

        menuButton.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          if (comp.getPayload() == "open") {
            monitoredScrollingVariable.value = true;
          } else {
            monitoredScrollingVariable.value = false;
          }
        });

        $(window).on(
          "resize",
          _.debounce(function () {
            console.log("resized");
            monitoredScrollingVariable.value = monitoredScrollingVariable.value;
          }, 100)
        );
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
