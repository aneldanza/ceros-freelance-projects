import { EVENTS } from "./constants";

export const initHeaderExperienceProxy = (observer, headerExperienceId) => {
  CerosSDK.findExperience(headerExperienceId)
    .done(function (experience) {
      console.log("header experience is found");

      let currentHighlightedSection = null; // Track the currently highlighted section

      const pageNavCollection = experience.findComponentsByTag(EVENTS.NAV);
      const activeSectionTitleCollection = experience.findLayersByTag(
        "active-section-title"
      );

      const highlightActiveSectionTitle = (payload) => {
        if (currentHighlightedSection === payload.toLowerCase()) {
          // If the current section is already highlighted, do nothing
          return;
        }

        // Loop through the section title elements
        activeSectionTitleCollection.layers.forEach((sectionTitleElement) => {
          if (
            sectionTitleElement.getPayload().toLowerCase() ===
            payload.toLowerCase()
          ) {
            // Highlight the new section and store it as the current section
            sectionTitleElement.show();
            currentHighlightedSection = payload.toLowerCase(); // Update current highlighted section
          } else {
            // Hide all other sections
            sectionTitleElement.hide();
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
