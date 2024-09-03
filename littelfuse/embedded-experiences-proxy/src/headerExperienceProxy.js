import { EVENTS } from "./constants";

export const initHeaderExperienceProxy = (observer, headerExperienceId) => {
  CerosSDK.findExperience(headerExperienceId)
    .done(function (experience) {
      console.log("header experience is found");

      const activeHeaders = {};

      const pageNavCollection = experience.findComponentsByTag(EVENTS.NAV);
      const activeSectionTitleCollection = experience.findLayersByTag(
        "active-section-title"
      );

      const highlightActiveSectionTitle = (payload) => {
        activeSectionTitleCollection.layers.forEach((sectionTitleElement) => {
          if (sectionTitleElement.getPayload() === payload) {
            if (!activeHeaders[payload]) {
              sectionTitleElement.show();
              activeHeaders[payload] = true;
              console.log("highlighting active section title " + payload);
            }
          } else {
            sectionTitleElement.hide();
            activeHeaders[sectionTitleElement.getPayload()] = false;
            console.log(
              "unhighlighting active section title " +
                sectionTitleElement.getPayload()
            );
          }
        });
      };

      // USE OBSERVER TO HIGHLIGHT ACTIVE SECTION TITLE
      observer.subscribe(EVENTS.VIEW, highlightActiveSectionTitle);

      pageNavCollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
        const payload = comp.getPayload();

        // USE OBSERVER TO NOTIFY BODY EXPERIENCE TO SCROLL TO A SECTION
        observer.notify(EVENTS.NAV, payload);
      });
    })
    .fail(function (e) {
      console.log(e);
    });
};
