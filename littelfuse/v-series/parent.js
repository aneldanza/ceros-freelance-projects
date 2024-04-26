let windowObjectReference = null;

window.addEventListener("message", function (event) {
  // Check if the message is the 'gtagEvent' message

  if (event.data) {
    const obj = JSON.parse(event.data);

    if (
      obj["event_category"] == "CEROS" &&
      obj["event_action"] === "outbound_link_click"
    ) {
      console.log(obj);
      // Send a click event to Google Analytics
      gtag("event", "ceros_click", {
        event_category: obj["event_category"],
        event_label: obj["event_label"],
        transport_type: "beacon",
        send_to: obj["tracking_id"],
        event_callback: function () {
          console.log("event is succeessfully sent");
          openRequestedSingleTab(obj["event_label"]);
        },
      });
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
