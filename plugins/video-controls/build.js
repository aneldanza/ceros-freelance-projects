({
  baseUrl: "./",
  name: "main",
  out: "dist/main.min.js",
  paths: {
    // your paths configuration
    CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
    videoController: "modules/videoController",
    EventHandler: "modules/eventHandler",
  },
  optimize: "none",
  findNestedDependencies: true,
});
