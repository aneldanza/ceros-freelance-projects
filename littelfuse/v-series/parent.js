let windowObjectReference = null;

window.addEventListener("message", function (event) {
  // Check if the message is the 'gtagEvent' message

  if (event.data && typeof event.data === "string") {
    const obj = JSON.parse(event.data);

    if (
      obj["event_category"] == "CEROS" &&
      obj["event_action"] === "outbound_link_click"
    ) {
      // Send a click event to Google Tag Manager
      try {
        openRequestedSingleTab(obj["event_label"]);

        dataLayer.push({
          event: "ceros-event",
          cerosAction: "ceros_outbound_link_click",
          cerosCategory: obj["event_category"],
          cerosLabel: obj["event_label"],
        });

      } catch (e) {
        Error(
          `could not open new tab for the following url: ${obj["event_label"]}`
        );
      }
    }
  }
});

function openRequestedSingleTab(url) {
  if (windowObjectReference === null || windowObjectReference.closed) {
    windowObjectReference = window.open(url, "_blank");
  } else {
    windowObjectReference = window.open(url, "_blank");
    windowObjectReference.focus();
  }
}