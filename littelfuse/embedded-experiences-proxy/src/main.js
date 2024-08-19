console.log(CerosSDK);
import { Register } from "./modules/register";
import { Messenger } from "./modules/Messenger";

const script = document.getElementById("page-header");

const bodyExperienceId = script.getAttribute("data-body-id");
const headerExperienceId = script.getAttribute("data-header-id");

const onExperiencesReady = (cerosFrames) => {
  console.log("Both header and body experiences are ready", cerosFrames);
  // You can now start interacting with CerosSDK using cerosFrames.body and cerosFrames.header
};
const register = new Register(
  bodyExperienceId,
  headerExperienceId,
  onExperiencesReady
);
const messenger = new Messenger(register);
