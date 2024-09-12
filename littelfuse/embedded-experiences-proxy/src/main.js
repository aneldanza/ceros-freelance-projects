import { Register } from "./modules/Register";
import { Messenger } from "./modules/Messenger";
import { Observer } from "./modules/Observer";
import { initBodyExperienceProxy } from "./bodyExperienceProxy.js";
import { initHeaderExperienceProxy } from "./headerExperienceProxy";

const script = document.getElementById("page-header");
const bodyExperienceId = script.getAttribute("data-body-id");
const headerExperienceId = script.getAttribute("data-header-id");

const observer = new Observer();

const register = new Register(
  bodyExperienceId,
  headerExperienceId,
  onExperiencesReady
);
new Messenger(register, observer);

function onExperiencesReady(cerosFrames) {
  console.log("Both header and body experiences are ready", cerosFrames);

  initBodyExperienceProxy(observer, bodyExperienceId);
  initHeaderExperienceProxy(observer, headerExperienceId);

  const scrollToTopArrow = document.getElementById("scrollToTopArrow");
  scrollToTopArrow.addEventListener("click", () => {
    register.bodyFrameData.scrollPosition = 0;
    register.scrollPageToFramePosition(cerosFrames.body, "smooth");
  });
}
