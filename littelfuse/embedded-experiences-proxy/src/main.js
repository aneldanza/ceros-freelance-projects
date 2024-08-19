import { CUSTOM_EVENT_NAMESPACE, EVENTS } from "./constants";
import { Register } from "./modules/register";
import { Messenger } from "./modules/Messenger";

const script = document.getElementById("page-header");

const bodyExperienceId = script.getAttribute("data-body-id");
const headerExperienceId = script.getAttribute("data-header-id");

const onExperiencesReady = (cerosFrames) => {
  console.log("Both header and body experiences are ready", cerosFrames);
  // You can now start interacting with CerosSDK using cerosFrames.body and cerosFrames.header

  CerosSDK.findExperience(headerExperienceId)
    .done(function (experience) {
      console.log("header experience is found");

      const pageNavCollection = experience.findComponentsByTag(EVENTS.NAV);

      pageNavCollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
        const payload = comp.getPayload();

        Messenger.sendEvent(
          cerosFrames.body,
          CUSTOM_EVENT_NAMESPACE + EVENTS.NAV,
          {
            section: payload,
          }
        );
      });
    })
    .fail(function (e) {
      console.log(e);
    });
};

const register = new Register(
  bodyExperienceId,
  headerExperienceId,
  onExperiencesReady
);
const messenger = new Messenger(register);
