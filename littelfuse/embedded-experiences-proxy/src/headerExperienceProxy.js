import { EVENTS } from "./constants";

export const initHeaderExperienceProxy = (observer, headerExperienceId) => {
  CerosSDK.findExperience(headerExperienceId)
    .done(function (experience) {
      console.log("header experience is found");

      const pageNavCollection = experience.findComponentsByTag(EVENTS.NAV);

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
