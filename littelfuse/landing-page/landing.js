// add on-viewport-resize action to scroll the body experience to the last selected position

(function () {
  "use strict";

  const script = document.getElementById("page-header");

  const bodyExperienceId = script.getAttribute("data-body-id");
  const headerExperienceId = script.getAttribute("data-header-id");

  var EVENT_NAMESPACE = "ceros-embedded-viewport:";
  var CEROS_EXPERIENCE_CLASS_NAME = "ceros-experience"; // the class that every ceros iframe should have on it
  var SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE = "data-ceros-origin-domains";

  var EVENTS = {
    // We ping embedded players to let them know that the scroll proxy is ready.  They are expected to respond
    // with the READY event.
    PING: "ping",

    // The player sends this event when it's loaded.  This lets us know to set up the scroll proxy for that frame.
    READY: "ready",
  };

  // The ceros frames.  We populate this in response to the ready event.
  var cerosFrames = {};
  // Frames that have been registered. Must have the 'ceros-experience' class to register. We maintain this list for security reasons and to avoid pinging the same frame twice.
  var registeredFrames = [];

  var originWhitelist = [];

  /**
   * Parse the origin domains comma-separated list into an array of domains
   * @param {string} originDomainsAttribute
   * @returns {string[]}
   */
  var parseOriginDomainsAttribute = function (originDomainsAttribute) {
    var origins = [];
    if (originDomainsAttribute) {
      var originValues = originDomainsAttribute.split(",");
      for (var i = 0; i < originValues.length; i++) {
        origins.push(originValues[i].trim().toLowerCase());
      }
    }
    return origins;
  };

  /**
   * Search list of frames for frame with given content window
   *
   * @param HTMLElement[] frameList
   * @param Window        testWindow
   * @returns HTMLElement
   */
  var findFrameWithWindow = function (frameList, testWindow) {
    for (var i = 0; i < frameList.length; i++) {
      var frame = frameList[i];
      if (frame.contentWindow === testWindow) {
        return frame;
      }
    }

    return null;
  };

  /**
   * Return true if the message origin is on the whitelist. If we don't have any whitelisted domains, this method
   * always returns true since this is an opt-in feature and we need to support existing embeds
   * @param {string} messageOrigin - origin attribute of the message (e.g. http://something.com)
   * @returns {boolean}
   */
  var isMessageOriginValid = function (messageOrigin) {
    if (originWhitelist.length === 0) {
      return true;
    }

    if (!messageOrigin) {
      return false;
    }

    var messageOriginDomain = messageOrigin.replace(/^https?:\/\//, "");
    for (var i = 0; i < originWhitelist.length; i++) {
      if (originWhitelist[i] === messageOriginDomain.toLowerCase()) {
        return true;
      }
    }

    return false;
  };

  /**
   * Does this message source match one of the registered frames?
   * @param messageSource {Window}
   * @returns {boolean}
   */
  var isMessageSourceValid = function (messageSource) {
    return findFrameWithWindow(registeredFrames, messageSource) !== null;
  };

  /**
   * Return a list of domains that we will accept messages from
   * @returns {string[]}
   */
  var createOriginWhitelist = function () {
    var originWhitelist = [];
    var scriptTags = document.querySelectorAll(
      "script[" + SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE + "]"
    );
    for (var i = 0; i < scriptTags.length; i++) {
      var originAttribute = scriptTags[i].getAttribute(
        SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE
      );
      originWhitelist = originWhitelist.concat(
        parseOriginDomainsAttribute(originAttribute)
      );
    }
    return originWhitelist;
  };

  /**
   * Sends an event to given frame
   *
   * @param HTMLElement targetFrame
   * @param string      event - one of our event constants
   * @param object      data
   */
  var sendEvent = function (targetFrame, event, data = {}) {
    var eventData = { event: EVENT_NAMESPACE + event, ...data };

    var payload = JSON.stringify(eventData);
    targetFrame.contentWindow.postMessage(payload, "*");
  };

  /**
   * Pings the given iframe with a message and marks the frame has having been pinged.
   * Note: If the same frame is provided twice it won't be pinged again until the frame is unregistered.
   *
   * @param frame
   */
  var registerFrame = function (frame) {
    var frameAlreadyRegistered = registeredFrames.indexOf(frame) !== -1;
    var frameCanPostMessages =
      frame.contentWindow &&
      typeof frame.contentWindow.postMessage === "function";

    if (!frameAlreadyRegistered && frameCanPostMessages) {
      // Ping frame in case it has a ceros experience that wants to participate in the scroll proxy action.
      // The frames will respond with the READY event.
      sendEvent(frame, EVENTS.PING);

      registeredFrames.push(frame);
      console.log(registeredFrames);
    }
  };
  /**
   * Query for all iframes in the DOM and attempt to register them
   */
  var registerAllFramesInDOM = function () {
    var allFrames = window.document.getElementsByTagName("iframe");
    registerFrames(allFrames);
  };

  /**
   * Loop through all the given frames and register the ones that have the ceros-experience class on them. This
   * prevents us from sending/receiving messages with non-ceros frames.
   * @param array{HTMLElement} allFrames
   */
  var registerFrames = function (allFrames) {
    for (var i = 0; i < allFrames.length; i++) {
      var frame = allFrames[i];
      var classAttribute = frame.getAttribute("class");
      if (
        classAttribute &&
        classAttribute.indexOf(CEROS_EXPERIENCE_CLASS_NAME) !== -1
      ) {
        registerFrame(frame);
      }
    }
  };

  // Register all existing frames in case there's already a Ceros embed that wants to participate in the scroll proxy
  // action before DOM has finished loading
  registerAllFramesInDOM();

  // Callback is fired when DOMContentLoaded is fired, or immediately if document is "ready" now
  var whenDOMIsReady = function (callback) {
    if (
      window.document.readyState === "complete" ||
      (window.document.readyState !== "loading" &&
        !window.document.documentElement.doScroll)
    ) {
      // IE 9/10 compat
      callback();
    } else {
      var completed = function () {
        window.document.removeEventListener("DOMContentLoaded", completed);
        callback();
      };

      window.document.addEventListener("DOMContentLoaded", completed);
    }
  };

  /**
   * Responds to the "READY" event by adding the frame to our list of ceros frames
   *
   * @param Window sourceWindow
   * @returns void
   */
  var handleReadyEvent = function (sourceWindow) {
    var foundFrame = findFrameWithWindow(
      window.document.getElementsByTagName("iframe"),
      sourceWindow
    );

    if (foundFrame) {
      console.log("Received ready event from frame", foundFrame);

      if (foundFrame.parentNode.id === bodyExperienceId) {
        cerosFrames.body = foundFrame;
      } else if (foundFrame.parentNode.id === headerExperienceId) {
        cerosFrames.header = foundFrame;
      }

      console.log("ceros frames");
      console.log(cerosFrames);
    }
  };

  /**
   * Dispatches incoming messages.
   *
   * @param MessageEvent message
   * @returns void
   */
  var processMessage = function (message) {
    var data, isValidMessage;

    if (
      !isMessageOriginValid(message.origin) ||
      !isMessageSourceValid(message.source)
    ) {
      return;
    }

    try {
      data = JSON.parse(message.data);

      // leave this in the try-catch block in case data.event is present but not a string
      isValidMessage =
        data &&
        data.event &&
        data.event.substr(0, EVENT_NAMESPACE.length) === EVENT_NAMESPACE;
    } catch (e) {
      // this could be a message from a different library so let's ignore it
      return;
    }

    if (isValidMessage) {
      switch (data.event.substr(EVENT_NAMESPACE.length)) {
        case EVENTS.READY:
          handleReadyEvent(message.source);
          break;

        default:
      }
    }
  };

  // Picks up any frames that were inserted in to the DOM _after_ the script tag loaded
  whenDOMIsReady(function () {
    // registerDOMMutationObserver();
    registerAllFramesInDOM();
  });

  originWhitelist = createOriginWhitelist();

  window.addEventListener("message", processMessage);

  if (CerosSDK && headerExperienceId && bodyExperienceId) {
    CerosSDK.findExperience("experience-66bbcde6ae8b7")
      .done(function (experience) {
        console.log("header experience is found");

        const pageNavCollection = experience.findComponentsByTag("page-nav");

        pageNavCollection.on(CerosSDK.EVENTS.CLICKED, (comp) => {
          const payload = comp.getPayload();

          console.log(payload);
          sendMessageToBody("page-nav", payload);
        });

        function sendMessageToBody(type, payload) {
          const iframes = document.querySelectorAll("iframe");
          for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i];
            if (iframe.parentNode.id === bodyExperienceId) {
              iframe.contentWindow.postMessage(
                JSON.stringify({
                  name: "page-header",
                  payload: { type, section: payload },
                }),
                iframe.src
              );
            }
          }
        }
      })
      .fail(function (e) {
        console.log(e);
      });
  }
})();
