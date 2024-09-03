export const EVENT_NAMESPACE = "ceros-embedded-viewport:";
export const CUSTOM_EVENT_NAMESPACE = "custom-ceros-embedded-viewport:";
export const CEROS_EXPERIENCE_CLASS_NAME = "ceros-experience"; // the class that every ceros iframe should have on it
export const SCROLL_PROXY_ORIGIN_DOMAINS_ATTRIBUTE =
  "data-ceros-origin-domains";

export const EVENTS = {
  // We ping embedded players to let them know that the scroll proxy is ready.  They are expected to respond
  // with the READY event.
  PING: "ping",

  // The player sends this event when it's loaded.  This lets us know to set up the scroll proxy for that frame.
  READY: "ready",

  NAV: "page-nav",

  VIEW: "view",
};
