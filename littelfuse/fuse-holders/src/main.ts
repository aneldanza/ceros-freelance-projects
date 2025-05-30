/// <reference path="../types/CerosSDK.d.ts" />

const script = document.getElementById("fuse-holders");

if (script === null) {
  throw Error("Could not find script fuse-holders");
}
const link = script.getAttribute("data-link") || "";
const distributor = script.getAttribute("data-distributor") || "";

// Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
let absUrl = "./";
const srcAttribute = script.getAttribute("src");

// Check that a src attibute was defined, and code hasn't been inlined by third party
if (typeof srcAttribute === "string" && new URL(srcAttribute)) {
  const srcURL = new URL(srcAttribute);
  const path = srcURL.pathname;
  const projectDirectory = path.split("/").slice(0, -1).join("/") + "/";
  absUrl = srcURL.origin + projectDirectory;
}

if (typeof require !== "undefined" && typeof require === "function") {
  require.config({
    baseUrl: "http://127.0.0.1:5173/",
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
    },
  });

  require(["CerosSDK"], function (CerosSDK: CerosSDK) {
    CerosSDK.findExperience()
      .done((experience: Experience) => {
        console.log(experience, CerosSDK);
      })
      .fail((e: any) => {
        console.log(e);
      });
  });
}
