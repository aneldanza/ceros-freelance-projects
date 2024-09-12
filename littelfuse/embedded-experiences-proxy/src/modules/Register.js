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
    this.bodyFrameData = {};
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
   * Handles a scroll to interaction message coming from the player.  Scrolls window to put the position in view.
   *
   * @param Window sourceWindow
   * @param object data
   *      @prop int scrollPosition - the Y position in ceros page coordinates to scroll to
   *      @prop int pageHeight     - the (over)height of the page in ceros page coordinates
   *      @prop int visibleHeight  - the height of the frame in ceros page coordinates
   * @returns void
   */
  handleScrollTo = function (sourceWindow, data) {
    var frame = this.findFrameWithWindow(sourceWindow);

    // check if sourcewindow is the body frame
    if (frame === this.cerosFrames.body) {
      this.bodyFrameData = data;
      this.scrollPageToFramePosition(frame);
    }
  };

  scrollPageToFramePosition = function (frame, scrollBehavior) {
    var positionInFrame = Math.max(
      0,
      this.bodyFrameData.scrollPosition -
        this.bodyFrameData.pageHeight +
        this.bodyFrameData.visibleHeight
    );

    var boundingRect = frame.getBoundingClientRect();
    var frameTop = window.pageYOffset + boundingRect.top;
    var frameBottom = window.pageYOffset + boundingRect.bottom;

    var frameHeight = boundingRect.bottom - boundingRect.top;
    var frameScrollPosition =
      (positionInFrame * frameHeight) / this.bodyFrameData.visibleHeight;

    var maxScroll = frameBottom - window.innerHeight;

    // Get the height of the sticky header (adjust this selector as needed)
    if (this.cerosFrames.header) {
      var headerHeight = this.cerosFrames.header.getBoundingClientRect().height;

      // Adjust the scroll position to account for the sticky header
      var scrollTarget = Math.min(
        frameScrollPosition + frameTop - headerHeight,
        maxScroll
      );

      // Use smooth scrolling
      window.scrollTo({
        top: scrollTarget,
        behavior: scrollBehavior, // This makes the scrolling smooth
      });
    }
  };

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
