define([], function () {
  class LandingPageProxy {
    constructor() {
      this.windowObjectReference = null;
      this.isPreview =
        window.self == window.top &&
        window.location.hostname.includes(".preview.ceros");
    }

    // send UA event with outbound link info
    sendUAEvent(link) {
      if (window.self !== window.top) {
        const data = {
          event_category: "CEROS",
          event_label: link,
          event_action: "outbound_link_click",
        };
        parent.postMessage(JSON.stringify(data), "*");
      } else {
        dataLayer.push({
          event: "ceros-event",
          cerosAction: "ceros_outbound_link_click",
          cerosCategory: "CEROS",
          cerosLabel: link,
        });
        this.openRequestedSingleTab(link);
      }
    }

    openRequestedSingleTab(url) {
      if (
        this.windowObjectReference === null ||
        this.windowObjectReference.closed
      ) {
        this.windowObjectReference = window.open(url, "_blank");
      } else {
        this.windowObjectReference = window.open(url, "_blank");
        this.windowObjectReference.focus();
      }
    }

    openAndTrackLink(url, isDoubleClickBug) {
      if (!isDoubleClickBug()) {
        if (this.isPreview) {
          this.openRequestedSingleTab(url);
        } else {
          this.sendUAEvent(url);
        }
      }
    }
  }

  return LandingPageProxy;
});
