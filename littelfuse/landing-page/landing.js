(function () {
  "use strict";

  const script = document.getElementById("page-header");

  const bodyExperienceId = script.getAttribute("data-body-id");
  const headerExperienceId = script.getAttribute("data-header-id");

  if (CerosSDK && headerExperienceId && bodyExperienceId) {
    CerosSDK.findExperience("experience-66bbcde6ae8b7")
      .done(function (experience) {
        console.log("header experience is found");

        const pageNavCollection = experience.findComponentsByTag("page-nav");

        pageNavCollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          const payload = comp.getPayload();

          console.log(payload);
          sendMessageToBody("page-nav", payload);
        });

        function sendMessageToBody(type, payload) {
          const iframes = document.querySelectorAll("iframe");
          for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i];
            if (iframe.parentNode.id === bodyExperienceId) {
              iframe.contentWindow.postMessage(
                JSON.stringify({
                  name: "page-header",
                  data: { type, payload },
                }),
                iframe.src
              );
            }
          }
        }
      })
      .fail(function (e) {
        console.log(e);
      });
  }
})();
