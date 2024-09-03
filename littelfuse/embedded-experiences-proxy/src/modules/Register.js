import { Messenger } from "./Messenger";

import {
  CEROS_EXPERIENCE_CLASS_NAME,
  EVENTS,
  EVENT_NAMESPACE,
} from "../constants";

export class Register {
  constructor(bodyExperienceId, headerExperienceId, onExperiencesReady) {
    this.registeredFrames = [];
    this.bodyExperienceId = bodyExperienceId;
    this.headerExperienceId = headerExperienceId;
    this.cerosFrames = {};
    this.onExperiencesReady = onExperiencesReady;
    this.init();
  }

  init() {
    // Register all existing frames in case there's already a Ceros embed that wants to participate in the scroll proxy
    // action before DOM has finished loading
    this.registerCerosFramesInDOM();

    // Picks up any frames that were inserted in to the DOM _after_ the script tag loaded
    this.whenDOMIsReady(() => {
      this.registerCerosFramesInDOM();
    });
  }

  /**
   * Responds to the "READY" event by adding the frame to our list of ceros frames
   *
   * @param Window sourceWindow
   * @returns void
   */
  handleReadyEvent = function (sourceWindow) {
    var foundFrame = this.findFrameWithWindow(sourceWindow);

    if (foundFrame) {
      if (foundFrame.parentNode.id === this.bodyExperienceId) {
        this.cerosFrames.body = foundFrame;
      } else if (foundFrame.parentNode.id === this.headerExperienceId) {
        this.cerosFrames.header = foundFrame;
      }

      // Check if both header and body experiences are ready
      if (this.cerosFrames.body && this.cerosFrames.header) {
        this.onExperiencesReady(this.cerosFrames);
      }
    }
  };

  /**
   * Responds to the "VIEW" event by showing the active section title in the header experience
   * @param Window sourceWindow
   * @param Object data
   * @returns void
   */
  handleViewEvent = function (sourceWindow, data) {
    var foundFrame = this.findFrameWithWindow(sourceWindow);

    if (foundFrame) {
      if (foundFrame === this.cerosFrames.body) {
        this.cerosFrames.header.contentWindow.postMessage(
          JSON.stringify(data),
          "*"
        );
      }
    }
  };

  // Callback is fired when DOMContentLoaded is fired, or immediately if document is "ready" now
  whenDOMIsReady = function (callback) {
    if (
      window.document.readyState === "complete" ||
      (window.document.readyState !== "loading" &&
        !window.document.documentElement.doScroll)
    ) {
      // IE 9/10 compat
      callback();
    } else {
      const completed = function () {
        window.document.removeEventListener("DOMContentLoaded", completed);
        callback();
      };

      window.document.addEventListener("DOMContentLoaded", completed);
    }
  };

  /**
   * Loop through all the given frames and register the ones that have the ceros-experience class on them. This
   * prevents us from sending/receiving messages with non-ceros frames.
   * @param
   */
  registerCerosFramesInDOM = function () {
    const allFrames = window.document.getElementsByTagName("iframe");

    for (let i = 0; i < allFrames.length; i++) {
      const frame = allFrames[i];
      const classAttribute = frame.getAttribute("class");
      if (
        classAttribute &&
        classAttribute.indexOf(CEROS_EXPERIENCE_CLASS_NAME) !== -1
      ) {
        this.registerFrame(frame);
      }
    }
  };

  /**
   * Pings the given iframe with a message and marks the frame has having been pinged.
   * Note: If the same frame is provided twice it won't be pinged again until the frame is unregistered.
   *
   * @param frame
   */
  registerFrame = function (frame) {
    var frameAlreadyRegistered = this.registeredFrames.indexOf(frame) !== -1;
    var frameCanPostMessages =
      frame.contentWindow &&
      typeof frame.contentWindow.postMessage === "function";

    if (!frameAlreadyRegistered && frameCanPostMessages) {
      // Ping frame in case it has a ceros experience that wants to participate in the scroll proxy action.
      // The frames will respond with the READY event.
      Messenger.sendEvent(
        frame,
        EVENT_NAMESPACE + EVENTS.PING,
        {},
        { message: EVENTS.READY, callback: this.handleReadyEvent }
      );

      this.registeredFrames.push(frame);
    }
  };

  /**
   * Search list of frames for frame with given content window
   *
   * @param HTMLElement[] frameList
   * @param Window        testWindow
   * @returns HTMLElement
   */
  findFrameWithWindow = function (testWindow) {
    for (let i = 0; i < this.registeredFrames.length; i++) {
      const frame = this.registeredFrames[i];
      if (frame.contentWindow === testWindow) {
        return frame;
      }
    }

    return null;
  };
}
