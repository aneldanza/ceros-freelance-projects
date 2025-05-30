/// <reference path="../types/CerosSDK.d.ts" />

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
