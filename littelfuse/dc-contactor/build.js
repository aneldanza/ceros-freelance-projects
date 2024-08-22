({
  baseUrl: "./",
  name: "main_with_modules",
  out: "dist/main.min.js",
  paths: {
    // your paths configuration
    CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
    PapaParse:
      "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min",
    NodeManager: "modules/NodeManager",
    NodeTree: "modules/NodeTree",
    QuizContext: "modules/quiz/QuizContext",
    Utils: "modules/Utils",
  },
  optimize: "none",
  findNestedDependencies: true,
});
