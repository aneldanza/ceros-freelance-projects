import { EVENTS } from "./constants";

export const initBodyExperienceProxy = (observer, bodyExperienceId) => {
  CerosSDK.findExperience(bodyExperienceId)
    .done(function (experience) {
      console.log("body experience is found");

      const navCollection = experience.findComponentsByTag("nav");

      // USE OBSERVER TO CALL handlePageNav WHEN NAVIGATION HOTSPOT IS CLICKED IN HEADER
      observer.subscribe(EVENTS.NAV, handlePageNav);

      function handlePageNav(payload) {
        const hotspot = navCollection.components.find(
          (comp) => comp.getPayload() === payload
        );
        if (hotspot) {
          hotspot.click();
        }
      }
    })
    .fail(function (e) {
      console.log(e);
    });
};
