import { Register } from "./modules/register";
import { Messenger } from "./modules/Messenger";
import { Observer } from "./modules/Observer";
import { initBodyExperienceProxy } from "./bodyExperienceProxy.js";
import { initHeaderExperienceProxy } from "./headerExperienceProxy";

const script = document.getElementById("page-header");

const bodyExperienceId = script.getAttribute("data-body-id");
const headerExperienceId = script.getAttribute("data-header-id");

const onExperiencesReady = (cerosFrames) => {
  console.log("Both header and body experiences are ready", cerosFrames);

  const observer = new Observer();

  initBodyExperienceProxy(observer, bodyExperienceId);
  initHeaderExperienceProxy(observer, headerExperienceId);
};

const register = new Register(
  bodyExperienceId,
  headerExperienceId,
  onExperiencesReady
);
new Messenger(register);
