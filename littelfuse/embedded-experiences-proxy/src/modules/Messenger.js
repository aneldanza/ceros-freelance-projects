import {
  SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE,
  EVENTS,
  EVENT_NAMESPACE,
} from "../constants";

export class Messenger {
  constructor(register) {
    this.originWhitelist = [];
    this.createOriginWhitelist();
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
  processMessage(message) {
    if (
      !this.isMessageOriginValid(message.origin) ||
      !this.isMessageSourceValid(message.source)
    ) {
      return;
    }

    let data;
    try {
      data = JSON.parse(message.data);
      if (data && data.event && data.event.startsWith(EVENT_NAMESPACE)) {
        this.dispatchEvent(
          data.event.substr(EVENT_NAMESPACE.length),
          message.source,
          data
        );
      }
    } catch (e) {
      // Ignore messages that are not JSON or are from different libraries
    }
  }

  /**
   * Dispatches an event based on the event type.
   *
   * @param {string} eventType - The type of event.
   * @param {Window} sourceWindow - The source window of the message.
   */
  dispatchEvent(eventType, sourceWindow, data) {
    switch (eventType) {
      case EVENTS.READY:
        this.register.handleReadyEvent(sourceWindow);
        break;

      default:
        break;
    }
  }

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
   * Creates a whitelist of origins based on the script tag's attribute.
   *
   * @returns {string[]} - Array of whitelisted origins.
   */
  createOriginWhitelist() {
    const scriptTags = document.querySelectorAll(
      `script[${SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE}]`
    );
    let whitelist = [];
    scriptTags.forEach((script) => {
      const originAttribute = script.getAttribute(
        SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE
      );
      whitelist = whitelist.concat(
        this.parseOriginDomainsAttribute(originAttribute)
      );
    });
    return whitelist;
  }

  /**
   * Parses the origin domains comma-separated list into an array.
   *
   * @param {string} originDomainsAttribute - The comma-separated list of origin domains.
   * @returns {string[]} - Array of origin domains.
   */
  parseOriginDomainsAttribute(originDomainsAttribute) {
    return originDomainsAttribute
      ? originDomainsAttribute
          .split(",")
          .map((origin) => origin.trim().toLowerCase())
      : [];
  }
}
