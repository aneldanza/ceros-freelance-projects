declare global {
  interface Window {
    dataLayer: any[];
  }
}

import { DoubleClickBugHandler } from "./DoubleClickBugHandler";

export class LandingPageProxy {
  private windowObjectReference: any;
  private isPreview: boolean;
  private doubleClickBugHandler: DoubleClickBugHandler;

  constructor() {
    this.windowObjectReference = null;
    this.doubleClickBugHandler = new DoubleClickBugHandler();
    this.isPreview =
      window.self == window.top &&
      window.location.hostname.includes(".preview.ceros");
  }

  // send UA event with outbound link info
  sendUAEvent(link: string) {
    if (window.self !== window.top) {
      const data = {
        event_category: "CEROS",
        event_label: link,
        event_action: "outbound_link_click",
      };
      parent.postMessage(JSON.stringify(data), "*");
    } else {
      window.dataLayer.push({
        event: "ceros-event",
        cerosAction: "ceros_outbound_link_click",
        cerosCategory: "CEROS",
        cerosLabel: link,
      });
      this.openRequestedSingleTab(link);
    }
  }

  openRequestedSingleTab(url: string) {
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

  openAndTrackLink(url: string, layerId: string) {
    if (!this.doubleClickBugHandler.isDoubleClickBug(layerId)) {
      if (this.isPreview) {
        this.openRequestedSingleTab(url);
      } else {
        this.sendUAEvent(url);
      }
    }
  }
}
