console.log(CerosSDK);
import { Register } from "./modules/register";
import { Messenger } from "./modules/Messenger";

const script = document.getElementById("page-header");

const bodyExperienceId = script.getAttribute("data-body-id");
const headerExperienceId = script.getAttribute("data-header-id");

const register = new Register(bodyExperienceId, headerExperienceId);
const messenger = new Messenger(register);
