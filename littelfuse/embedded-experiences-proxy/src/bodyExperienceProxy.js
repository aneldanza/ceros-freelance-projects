import { EVENTS } from "./constants";

export const initBodyExperienceProxy = (observer, bodyExperienceId) => {
  const bodyContainer = document.querySelector(".body-container");

  function updateContainerHeights() {
    const siteHeader = document.querySelector(".site-header");
    const siteHeaderHeight = siteHeader.offsetHeight;
    document.documentElement.style.setProperty(
      "--site-header-height",
      `${siteHeaderHeight}px`
    );
    // iframesContainer.style.marginTop = `${siteHeaderHeight}px`;
    bodyContainer.style.height = `calc(100vh - ${siteHeaderHeight}px)`;
  }

  // Initial update
  updateContainerHeights();

  // Update on window resize
  window.addEventListener("resize", updateContainerHeights);

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
