import { Register } from "./modules/Register";
import { Messenger } from "./modules/Messenger";
import { Observer } from "./modules/Observer";
import { initBodyExperienceProxy } from "./bodyExperienceProxy.js";
import { initHeaderExperienceProxy } from "./headerExperienceProxy";

const script = document.getElementById("page-header");

const bodyExperienceId = script.getAttribute("data-body-id");
const headerExperienceId = script.getAttribute("data-header-id");
const iframesContainer = document.querySelector("#iframes-container");
const observer = new Observer();

const onExperiencesReady = (cerosFrames) => {
  console.log("Both header and body experiences are ready", cerosFrames);

  initBodyExperienceProxy(observer, bodyExperienceId);
  initHeaderExperienceProxy(observer, headerExperienceId);

  iframesContainer.addEventListener("scroll", () => {
    console.log("scrolling iframes container from main.js");
  });

  window.addEventListener("scroll", () => {
    console.log("scrolling from main.js");
  });
};

const register = new Register(
  bodyExperienceId,
  headerExperienceId,
  onExperiencesReady
);
new Messenger(register, observer);
