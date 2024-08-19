import {
  SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE,
  EVENTS,
  EVENT_NAMESPACE,
} from "../constants";

export class Messenger {
  constructor(register) {
    this.originWhitelist = [];
    this.createOriginWhitelist();
    this.responseCallbacks = {};
    this.register = register;

    window.addEventListener("message", this.processMessage.bind(this));
  }

  /**
   * Sends an event to given frame
   *
   * @param HTMLElement targetFrame
   * @param string      event - one of our event constants
   * @param object      data
   */
  static sendEvent = function (targetFrame, event, data = {}) {
    const eventData = { event: event, ...data };

    const payload = JSON.stringify(eventData);
    targetFrame.contentWindow.postMessage(payload, "*");
  };

  /**
   * Dispatches incoming messages.
   *
   * @param MessageEvent message
   * @returns void
   */
  processMessage = function (message) {
    var data, isValidMessage;

    if (
      !this.isMessageOriginValid(message.origin) ||
      !this.isMessageSourceValid(message.source)
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
          this.register.handleReadyEvent(message.source);
          break;

        default:
      }
    }
  };

  /**
   * Does this message source match one of the registered frames?
   * @param messageSource {Window}
   * @returns {boolean}
   */
  isMessageSourceValid = function (messageSource) {
    return this.register.findFrameWithWindow(messageSource) !== null;
  };

  /**
   * Return true if the message origin is on the whitelist. If we don't have any whitelisted domains, this method
   * always returns true since this is an opt-in feature and we need to support existing embeds
   * @param {string} messageOrigin - origin attribute of the message (e.g. http://something.com)
   * @returns {boolean}
   */
  isMessageOriginValid = function (messageOrigin) {
    if (this.originWhitelist.length === 0) {
      return true;
    }

    if (!messageOrigin) {
      return false;
    }

    var messageOriginDomain = messageOrigin.replace(/^https?:\/\//, "");
    for (var i = 0; i < this.originWhitelist.length; i++) {
      if (this.originWhitelist[i] === messageOriginDomain.toLowerCase()) {
        return true;
      }
    }

    return false;
  };

  /**
   * Return a list of domains that we will accept messages from
   * @returns {string[]}
   */
  createOriginWhitelist = function () {
    const scriptTags = document.querySelectorAll(
      "script[" + SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE + "]"
    );
    for (let i = 0; i < scriptTags.length; i++) {
      const originAttribute = scriptTags[i].getAttribute(
        SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE
      );
      this.originWhitelist = this.originWhitelist.concat(
        this.parseOriginDomainsAttribute(originAttribute)
      );
    }
  };

  /**
   * Parse the origin domains comma-separated list into an array of domains
   * @param {string} originDomainsAttribute
   * @returns {string[]}
   */
  parseOriginDomainsAttribute = function (originDomainsAttribute) {
    const origins = [];
    if (originDomainsAttribute) {
      const originValues = originDomainsAttribute.split(",");
      for (let i = 0; i < originValues.length; i++) {
        origins.push(originValues[i].trim().toLowerCase());
      }
    }
    return origins;
  };
}
