import { Register } from "./modules/register";
import { Messenger } from "./modules/Messenger";
import { Observer } from "./modules/Observer";
import { initBodyExperienceProxy } from "./bodyExperienceProxy.js";
import { initHeaderExperienceProxy } from "./headerExperienceProxy";

const script = document.getElementById("page-header");

const bodyExperienceId = script.getAttribute("data-body-id");
const headerExperienceId = script.getAttribute("data-header-id");
const siteHeader = document.querySelector(".site-header");
const bodyContainer = document.querySelector(".body-container");
// const cerosIframeContainer = document.querySelector(".iframes-container");

const onExperiencesReady = (cerosFrames) => {
  console.log("Both header and body experiences are ready", cerosFrames);

  const observer = new Observer();

  initBodyExperienceProxy(observer, bodyExperienceId);
  initHeaderExperienceProxy(observer, headerExperienceId);

  function updateContainerHeights() {
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
};

const register = new Register(
  bodyExperienceId,
  headerExperienceId,
  onExperiencesReady
);
new Messenger(register);
