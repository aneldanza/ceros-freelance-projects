/**
 * # Ceros scroll proxy
 */
(function (global, factory) {
  /* global module */
  if (typeof module === "object" && typeof module.exports === "object") {
    // For CommonJS and CommonJS-like environments where a proper `window`
    // is present, execute the factory and get cerosScrollProxy.
    // For environments that do not have a `window` with a `document`
    // (such as Node.js), expose a factory as module.exports.
    // This accentuates the need for the creation of a real `window`.
    // e.g. var scrollProxy = require("cerosScrollProxy")(window);
    module.exports = global.document
      ? factory(global)
      : function (w) {
          if (!w.document) {
            throw new Error(
              "cerosScrollProxy requires a window with a document"
            );
          }
          return factory(w);
        };
  } else {
    factory(global);
  }

  // Pass `this` if `window` is not defined yet
})(typeof window !== "undefined" ? window : this, function (window) {
  // eslint-disable-line

  // The scroll proxy is included in embed code so it might be included more than once if there is more than
  // one ceros embed on the page.  Set a flag on window and bail if the flag is set.
  var GLOBAL_FLAG = "CEROS_SCROLL_PROXY_LOADED";
  if (window[GLOBAL_FLAG]) {
    return;
  }
  window[GLOBAL_FLAG] = true;

  var EVENT_NAMESPACE = "ceros-embedded-viewport:";
  var EVENTS = {
    // We ping embedded players to let them know that the scroll proxy is ready.  They are expected to respond
    // with the READY event.
    PING: "ping",

    // The player sends this event when it's loaded.  This lets us know to set up the scroll proxy for that frame.
    READY: "ready",

    // We send this event to the player when the position of the frame changes (window scroll or resize)
    POSITION: "position",

    // The player sends us this event when there is a scroll interaction so that we can scroll the parent window.
    SCROLL_TO: "scroll-to",

    // A click interaction with the action "go to url" has been trigged in
    // the experience.  Navigate the parent page to the URL in question.
    GOTO_URL: "goto-url",

    // The player sends this event when the variant is detected (or re-detected)
    VARIANT_DETECTION: "variant-detection",

    GLOBAL_FUNCTION_INVOKE: "global-function",
  };

  var ASPECT_RATIO_FALLBACK_ATTRIBUTE = "data-aspectRatio";
  var SCROLL_BROADCASTER_SELECTOR_ATTRIBUTE = "data-scrollEvent-selector";
  var SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE = "data-ceros-origin-domains";
  var CEROS_EXPERIENCE_CLASS_NAME = "ceros-experience"; // the class that every ceros iframe should have on it

  // The ceros frames.  We populate this in response to the ready event.
  var cerosFrames = [];
  // Frames that have been registered. Must have the 'ceros-experience' class to register. We maintain this list for security reasons and to avoid pinging the same frame twice.
  var registeredFrames = [];

  // Any custom scroll event listeners we set up on elements are stored here for cleanup
  var customScrollListeners = [];

  var originWhitelist = [];

  var prepareCerosFrame = function (frame) {
    checkForAspectRatios(frame);
    checkForSubPixelIframes(frame);
    registerCustomScrollListenerForFrame(frame);
  };

  // Old embeds will not have data-variant-aspectRatio attributes, so we should grab the current padding bottom value and store that as the desktop/fallback ratio
  var checkForAspectRatios = function (frame) {
    var container = getFrameContainer(frame);

    // set the padding-bottom percentage as the fallback ratio if the fallback attribute is missing
    var existingFallbackRatio = container.getAttribute(
      ASPECT_RATIO_FALLBACK_ATTRIBUTE
    );
    if (!existingFallbackRatio) {
      var aspectRatio = paddingPercentageToRatio(container.style.paddingBottom);
      container.setAttribute(ASPECT_RATIO_FALLBACK_ATTRIBUTE, aspectRatio);
      logDebug(
        "Defaulting to fallback aspect ratio from paddingBottom",
        aspectRatio
      );
    }
  };

  // Fixes scaling issue where the iframe is a fraction of a pixel (i.e. 1240.56px) wide
  // Browsers round up the iframe width, but round down the frame document, leaving a gap
  // This method finds these dodgy iframes and rounds up to a full pixel, as its better to lose a pixel than have a 1px gap
  // If the iframe has been scaled by a transform (i.e. ceros embedding ceros) we can't accurately round up and so skip the resize
  var checkForSubPixelIframes = function (frame) {
    var container = getFrameContainer(frame);

    // if dimensions have been overridden put back to original to get frame to grow to container size for resize event
    if (frame.getAttribute("data-ceros-subpixel-oversize") === "true") {
      frame.setAttribute("data-ceros-subpixel-oversize", "false");
      frame.style.width = frame.getAttribute(
        "data-ceros-subpixel-original-width"
      );
      frame.style.height = frame.getAttribute(
        "data-ceros-subpixel-original-height"
      );
    }

    // get the iframe width from bounding rect to see if its a decimal
    var boundingRect = frame.getBoundingClientRect();
    var fullPixelWidth = Math.ceil(boundingRect.width);
    var fullPixelHeight = Math.ceil(boundingRect.height);
    var dimensionWasDecimal =
      boundingRect.width !== fullPixelWidth ||
      boundingRect.height !== fullPixelHeight;

    if (dimensionWasDecimal) {
      // If the difference between the actual iframe size (from getBoundingClientRect) and offsetWidth/Height
      // are greater than 1px assume the iframe has been scaled by a `transform: scale()` and skip changing the
      // frame size, as we can't accurately calculate the dimensions that would result in a full pixel frame
      var differenceBetweenFrameAndBoundingRectSize = Math.abs(
        fullPixelWidth - frame.offsetWidth
      );
      var frameIsScaled = differenceBetweenFrameAndBoundingRectSize > 1;

      if (frameIsScaled) {
        logDebug(
          "Frame is subpixel but skipping resize because it is scaled",
          frame
        );
        return;
      }

      // mark frame as modified
      frame.setAttribute("data-ceros-subpixel-oversize", "true");
      // keep a copy of the original values incase we get resized
      frame.setAttribute(
        "data-ceros-subpixel-original-width",
        frame.style.width
      );
      frame.setAttribute(
        "data-ceros-subpixel-original-height",
        frame.style.height
      );

      // grab the padding-bottom from the container div as that controls the aspect ratio
      var aspectRatio = paddingPercentageToRatio(container.style.paddingBottom);

      // adjust the iframe size to full pixels
      frame.style.width = fullPixelWidth + "px";
      // if we don't adjust height we can end up with the experience using height scaling > width in some cases, giving us a pixel border
      frame.style.height = Math.ceil(fullPixelWidth / aspectRatio) + "px";

      logDebug("Frame size was subpixel, adjusted to next whole pixel");
    }
  };

  var getFrameContainer = function (frame) {
    return frame.parentElement;
  };

  var getAspectRatioForVariant = function (frame, variant) {
    var container = getFrameContainer(frame);
    var aspectRatioAttribute =
      variant === "desktop"
        ? "data-aspectRatio"
        : "data-" + variant + "-aspectRatio";
    var variantRatio = container.getAttribute(aspectRatioAttribute);

    if (!variantRatio) {
      variantRatio = container.getAttribute(ASPECT_RATIO_FALLBACK_ATTRIBUTE);
    }

    // force to float or null
    return variantRatio ? +variantRatio : null;
  };

  var updateAspectRatioForVariant = function (frame, variant) {
    var ratio = getAspectRatioForVariant(frame, variant);

    if (ratio) {
      updateAspectRatio(frame, ratio);
    }
  };

  var updateAspectRatio = function (frame, ratio) {
    var container = getFrameContainer(frame);
    var currentRatio = paddingPercentageToRatio(container.style.paddingBottom);

    if (currentRatio !== ratio) {
      container.style.paddingBottom = ratioToPaddingPercentage(ratio);
      logDebug("Updated aspect ratio to", ratio);

      handleViewportResize();
    }
  };

  var paddingPercentageToRatio = function (padding) {
    return 100 / parseFloat(padding);
  };

  var ratioToPaddingPercentage = function (ratio) {
    return (100 / ratio).toFixed(2) + "%"; // the ExperienceEmbedService rounds to 2dp so we will here too
  };

  /**
   * Registers a custom scroll event listener for the frame
   *
   * If the iframe has a `data-scrollEvent-selector` attribute this method will set up a 'scroll' event listener on
   * the resolved element. On a scroll event `sendViewportPositionEvent` is called as we do for viewport scroll.
   *
   * The value of the attribute should be a `document.querySelector` compatible selector, the first match is used if
   * there are multiple.
   *
   * If the attribute is set but no element in the DOM matches a warning is logged.
   *
   * @param frame
   */
  var registerCustomScrollListenerForFrame = function (frame) {
    var scrollBroadcasterSelector =
      resolveScrollBroadcasterSelectorForFrame(frame);

    if (scrollBroadcasterSelector) {
      var scrollEventBroadcaster = window.document.querySelector(
        scrollBroadcasterSelector
      );
      if (scrollEventBroadcaster) {
        var scrollEventHandler = function () {
          sendViewportPositionEvent(frame);
        };

        customScrollListeners.push({
          frame: frame,
          element: scrollEventBroadcaster,
          handler: scrollEventHandler,
        });

        scrollEventBroadcaster.addEventListener("scroll", scrollEventHandler);
        logDebug(
          "Registered custom scroll listener on",
          scrollEventBroadcaster,
          "for",
          frame
        );
      } else {
        logWarn(
          "No element found for scroll broadcast selector",
          scrollBroadcasterSelector
        );
      }
    }
  };

  /**
   * Removes any custom scroll event listeners that have been set up for this frame
   *
   * @param frame
   */
  var unregisterCustomScrollListenerForFrame = function (frame) {
    for (var i = 0; i < customScrollListeners.length; i++) {
      var customScrollListener = customScrollListeners[i];
      if (customScrollListener.frame === frame) {
        customScrollListener.element.removeEventListener(
          "scroll",
          customScrollListener.handler
        );
        customScrollListeners.splice(i, 1);
        return;
      }
    }
  };

  /**
   * Resolves the scroll broadcaster for the given frame
   *
   * Priority is:
   *   1. an optional data-scrollEvent-selector attribute on the frame itself
   *   2. an optional global variable `cerosScrollEventSelector`
   *   3. none (returns false)
   *
   * @param frame
   * @return string|false
   */
  var resolveScrollBroadcasterSelectorForFrame = function (frame) {
    var iFrameSelector = frame.getAttribute(
      SCROLL_BROADCASTER_SELECTOR_ATTRIBUTE
    );
    if (iFrameSelector) {
      return iFrameSelector;
    }

    if (window.cerosScrollEventSelector) {
      return window.cerosScrollEventSelector;
    }

    return false;
  };

  /**
   * Sends a message to given ceros embed frame letting it know where the frame is on the page.
   *
   * @param HTMLElement frame
   * @returns void
   */
  var sendViewportPositionEvent = function (frame) {
    var boundingRect = frame.getBoundingClientRect();
    var windowDimensions = getParentWindowDimensions();
    var screenDimensions = getParentScreenDimensions();

    var data = {
      top: -boundingRect.top,
      bottom: window.innerHeight - boundingRect.top,
      windowWidth: windowDimensions.width,
      windowHeight: windowDimensions.height,
      screenWidth: screenDimensions.width,
      screenHeight: screenDimensions.height,
    };

    sendEvent(frame, EVENTS.POSITION, data);
  };

  /**
   * Get the dimensions of the browser window for adaptive layouts variant detection
   *
   * On mobile devices a virtual viewport is used if the website doesn't specify a viewport setting. In this
   * case window.innerWidth will be greater than the screen size so we assume we're on mobile and use
   * screen.width for the dimension
   *
   * @return {{width: number, height: number}}
   */
  var getParentWindowDimensions = function () {
    var screenDimensions = getParentScreenDimensions();
    var screenIsSmallerThanWindow =
      screenDimensions.width && screenDimensions.width < window.innerWidth;
    var width = screenIsSmallerThanWindow
      ? screenDimensions.width
      : window.innerWidth;
    var height = screenIsSmallerThanWindow
      ? screenDimensions.height
      : window.innerHeight;

    return {
      width: width,
      height: height,
    };
  };

  /**
   * Grab the screen dimensions
   *
   * In dev tools the iframe screen dimensions are incorrect when emulating mobile devices, so we pass down screen dimensions
   * from embed to embed using window.cerosScreenDimensions (see ScreenSize.js for more info)
   *
   * @return {{width: number, height: number}}
   */
  var getParentScreenDimensions = function () {
    return {
      width: window.cerosScreenDimensions
        ? window.cerosScreenDimensions.width
        : window.screen.width,
      height: window.cerosScreenDimensions
        ? window.cerosScreenDimensions.height
        : window.screen.height,
    };
  };

  /**
   * Sends a viewport change message to all ceros frames
   *
   * @returns void
   */
  var handleViewportPositionChange = function () {
    for (var i = 0; i < cerosFrames.length; i++) {
      sendViewportPositionEvent(cerosFrames[i]);
    }
  };

  /**
   * Checks for subpixel iframes, then sends a viewport change message to all ceros frames
   *
   * @returns void
   */
  var handleViewportResize = function () {
    for (var i = 0; i < cerosFrames.length; i++) {
      var frame = cerosFrames[i];
      checkForSubPixelIframes(frame);
      sendViewportPositionEvent(frame);
    }
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
      logDebug("Received ready event from frame", foundFrame);

      prepareCerosFrame(foundFrame);
      cerosFrames.push(foundFrame);

      // send current position now frame is set up
      sendViewportPositionEvent(foundFrame);
    }
  };

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
  var handleScrollTo = function (sourceWindow, data) {
    var frame = findFrameWithWindow(cerosFrames, sourceWindow);

    if (frame) {
      // The page inside the frame will have been scrolled so we calculate the position of the scroll target
      // (still in experience coordinates) after scroll.
      var positionInFrame = Math.max(
        0,
        data.scrollPosition - data.pageHeight + data.visibleHeight
      );

      var boundingRect = frame.getBoundingClientRect();
      var frameTop = window.pageYOffset + boundingRect.top;
      var frameBottom = window.pageYOffset + boundingRect.bottom;

      var frameHeight = boundingRect.bottom - boundingRect.top;
      var frameScrollPosition =
        (positionInFrame * frameHeight) / data.visibleHeight;

      var maxScroll = frameBottom - window.innerHeight;

      window.scroll(0, Math.min(frameScrollPosition + frameTop, maxScroll));
    }
  };

  /**
   * We'll go to a new URL here in the scroll proxy so that the referer will
   * be the parent domain, instead of view.ceros.com
   *
   * @param   {Window}    sourceWindow    The frame this event came from.
   * @param   {Object}    data    A data object, containing the event data.
   * @param   {string}    data.url    The url we'd like to go to.
   *
   * @return  {void}
   */
  var handleGotoUrl = function (sourceWindow, data) {
    var blockedProtocol = "javascript:";
    if (data.url) {
      if (data.url.trim().toLowerCase().indexOf(blockedProtocol) === 0) {
        return;
      }
      try {
        var parsedUrl = new URL(data.url);
        if (parsedUrl.protocol === blockedProtocol) {
          return;
        }
      } catch (e) {}
    }

    if (data.urlOpenInNewWindow) {
      window.open(data.url);
    } else {
      window.location = data.url;
    }
  };

  var handleVariantDetectionEvent = function (sourceWindow, data) {
    var frame = findFrameWithWindow(cerosFrames, sourceWindow);

    if (frame) {
      updateAspectRatioForVariant(frame, data.variant);
    }
  };

  /**
   * Finds the global function on the window object
   * @param {object} globalFunction
   *    @prop {string} functionPath - dotted path to function
   *    @prop {array} args - list of arguments to invoke the function with
   * @returns {function|boolean} - Returns either the function or false if it can't be found
   */
  var findGlobalFunction = function (globalFunction) {
    if (!globalFunction || !globalFunction.functionPath) {
      return false;
    }

    var DISPATCH_EVENT_FUNC = "document.body.dispatchEvent";

    // make sure we have an expected function path
    var ALLOWED_FUNCTION_PATHS = [
      "ga",
      "gtag",
      "dataLayer.push",
      DISPATCH_EVENT_FUNC,
    ];
    if (ALLOWED_FUNCTION_PATHS.indexOf(globalFunction.functionPath) === -1) {
      return false;
    }

    var args = Array.isArray(globalFunction.args) ? globalFunction.args : [];

    if (
      globalFunction.functionPath === DISPATCH_EVENT_FUNC &&
      typeof window.CustomEvent === "function"
    ) {
      if (args.length === 2) {
        args = [new window.CustomEvent(args[0], args[1])];
      } else {
        return false;
      }
    }

    var obj = window;
    var func = null;
    var pathParts = globalFunction.functionPath.split(".");

    for (var i = 0; i < pathParts.length; i++) {
      if (i > 0) {
        obj = func;
      }
      func = obj[pathParts[i]];
      if (!func) {
        break;
      }
    }

    if (obj && func && typeof func === "function") {
      return function () {
        return func.apply(obj, args);
      };
    } else {
      return false;
    }
  };

  /**
   * Handle a global function invoke
   * @param {object[]} globalFunctions
   *    @prop {string} functionPath - dotted path to function
   *    @prop {array} args - list of arguments to invoke the function with
   */
  var invokeGlobalFunctions = function (globalFunctions) {
    if (!Array.isArray(globalFunctions)) {
      return;
    }

    for (var i = 0; i < globalFunctions.length; i++) {
      var func = findGlobalFunction(globalFunctions[i]);
      if (func) {
        func();
        break;
      }
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

        case EVENTS.SCROLL_TO:
          handleScrollTo(message.source, data);
          break;

        case EVENTS.GOTO_URL:
          handleGotoUrl(message.source, data);
          break;

        case EVENTS.VARIANT_DETECTION:
          handleVariantDetectionEvent(message.source, data);
          break;

        case EVENTS.GLOBAL_FUNCTION_INVOKE:
          if (data && data.globalFunctions) {
            invokeGlobalFunctions(data.globalFunctions);
          }
          break;

        default:
      }
    }
  };

  /**
   * Sends an event to given frame
   *
   * @param HTMLElement targetFrame
   * @param string      event - one of our event constants
   * @param object      data
   */
  var sendEvent = function (targetFrame, event, data) {
    var eventData = { event: EVENT_NAMESPACE + event };
    if (data) {
      for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
          eventData[prop] = data[prop];
        }
      }
    }

    var payload = JSON.stringify(eventData);
    targetFrame.contentWindow.postMessage(payload, "*");
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
      logDebug("Registered frame", frame);
    }
  };

  var unregisterFrames = function (frames) {
    for (var i = 0; i < frames.length; i++) {
      unregisterFrame(frames[i]);
    }
  };

  /**
   * Removes frame from scroll proxy
   *
   * Unregisters any custom scroll listeners associated with the frame.
   *
   * @param frame
   */
  var unregisterFrame = function (frame) {
    var registeredFrameIndex = registeredFrames.indexOf(frame);
    var isRegisteredFrame = registeredFrameIndex !== -1;

    if (isRegisteredFrame) {
      var cerosFrameIndex = cerosFrames.indexOf(frame);
      var isCerosFrame = cerosFrameIndex !== -1;

      if (isCerosFrame) {
        unregisterCustomScrollListenerForFrame(frame);
        cerosFrames.splice(cerosFrameIndex, 1);
      }

      registeredFrames.splice(registeredFrameIndex, 1);
      logDebug("Unregistered frame", frame.src);
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
   * On mutation events from the MutationObserver
   *
   * Checks to see if there are any iframes that have been inserted or removed from the DOM, registering or
   * unregistering them
   *
   * @param mutationList
   */
  var handleDOMChange = function (mutationList) {
    for (var i = 0; i < mutationList.length; i++) {
      var mutation = mutationList[i];
      if (mutation.type === "childList") {
        handleDOMAddedNodes(mutation.addedNodes);
        handleDOMRemovedNodes(mutation.removedNodes);
      }
    }
  };

  /**
   * If the inserted node, of any of its descendants are iframes, register them with the scroll proxy
   *
   * @param addedNodes
   */
  var handleDOMAddedNodes = function (addedNodes) {
    for (var i = 0; i < addedNodes.length; i++) {
      var addedNode = addedNodes[i];

      var newFrames = [];
      if (addedNode.nodeName === "IFRAME") {
        newFrames.push(addedNode);
      } else if (typeof addedNode.getElementsByTagName === "function") {
        var descendantIframes = addedNode.getElementsByTagName("iframe");
        Array.prototype.push.apply(newFrames, descendantIframes);
      }

      registerFrames(newFrames);
    }
  };

  /**
   * If the removed node, or any of its descendants were iframes, unregister them from the scroll proxy
   *
   * @param removedNodes
   */
  var handleDOMRemovedNodes = function (removedNodes) {
    for (var i = 0; i < removedNodes.length; i++) {
      var removedNode = removedNodes[i];

      var oldFrames = [];
      if (removedNode.nodeName === "IFRAME") {
        oldFrames.push(removedNode);
      } else if (typeof removedNode.getElementsByTagName === "function") {
        var descendantIframes = removedNode.getElementsByTagName("iframe");
        Array.prototype.push.apply(oldFrames, descendantIframes);
      }

      unregisterFrames(oldFrames);
    }
  };

  var logDebug = function () {
    if (window.console && window.console.debug) {
      window.console.debug.apply(window.console, arguments);
    }
  };

  var logWarn = function () {
    if (window.console && window.console.warn) {
      window.console.warn.apply(window.console, arguments);
    }
  };

  // Register a DOM mutation listener to register and unregister frames
  // Called once DOMContentLoaded has fired to avoid listening to intial DOM creation events
  var registerDOMMutationObserver = function () {
    if (MutationObserver && window.document) {
      var observer = new MutationObserver(handleDOMChange);
      observer.observe(window.document, { childList: true, subtree: true });
    }
  };

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

  // Expose a public API if included as a module
  var cerosScrollProxy = {
    registerFrame: registerFrame,
    unregisterFrame: unregisterFrame,
    sendViewportPositionEvent: sendViewportPositionEvent,
  };

  // Register as an AMD module if AMD is detected
  /* global define */
  if (typeof define === "function" && define.amd) {
    define("cerosScrollProxy", [], function () {
      return cerosScrollProxy;
    });
  }

  // Expose this method so that inserted experiences can update the viewport when they're ready (backwards compatibility)
  window.sendViewportPositionEvent = sendViewportPositionEvent;

  // Register all existing frames in case there's already a Ceros embed that wants to participate in the scroll proxy
  // action before DOM has finished loading
  registerAllFramesInDOM();

  // Picks up any frames that were inserted in to the DOM _after_ the script tag loaded
  whenDOMIsReady(function () {
    registerDOMMutationObserver();
    registerAllFramesInDOM();
  });

  originWhitelist = createOriginWhitelist();

  window.addEventListener("message", processMessage);
  window.addEventListener("scroll", handleViewportPositionChange);
  window.addEventListener("resize", handleViewportResize);

  // eslint-disable-next-line no-undef
  if (typeof NODE_ENV !== "undefined" && NODE_ENV === "test") {
    cerosScrollProxy.handleGotoUrl = handleGotoUrl;
  }

  return cerosScrollProxy;
});
