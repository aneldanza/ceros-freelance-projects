(function ($) {
  "use strict";

  const script = document.getElementById("dc-contactor");
  const link = script.getAttribute("data-link") || "";
  const distributor = script.getAttribute("data-distributor") || "";

  // Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
  let absUrl = "./";
  const srcAttribute = script.getAttribute("src");

  // Check that a src attibute was defined, and code hasn't been inlined by third party
  if (typeof srcAttribute !== "undefined" && new URL(srcAttribute)) {
    const srcURL = new URL(srcAttribute);
    const path = srcURL.pathname;
    const projectDirectory = path.split("/").slice(0, -1).join("/") + "/";
    absUrl = srcURL.origin + projectDirectory;
  }

  // Only run this at runtime
  if (typeof require !== "undefined") {
    // load CerosSDK via requirejs
    require.config({
      paths: {
        CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
        PapaParse:
          "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min",
        modules: absUrl + "modules",
      },
    });
  }

  require([
    "CerosSDK",
    "PapaParse",
    "modules/NodeManager",
    "modules/NodeTree",
    "modules/quiz/QuizContext",
    "modules/Utils",
  ], function (CerosSDK, PapaParse, NodeManager, NodeTree, QuizContext, Utils) {
    // find experience to interact with
    CerosSDK.findExperience()
      .done(function (experience) {
        const navDict = {
          application: "Application: {{}}",
          "max-voltage": "Max Voltage: {{}}V",
          "current-rating": "Current: {{}}A",
          "coil-voltage": "Coil Voltage: {{}}V",
          mounting: "Mounting: {{}}",
          "aux-contacts": "Aux Contacts: {{}}",
          polarized: "Polarized: {{}}",
        };

        const keys = [
          "application",
          "max-voltage",
          "current-rating",
          "coil-voltage",
          "mounting",
          "aux-contacts",
          "polarized",
          "part",
        ];

        const hidingQuestions = ["coil-voltage", "current-rating"];

        //Initiate Utils
        const utils = new Utils();

        // Initiate NodeTree
        const nodeTree = new NodeTree(keys);

        // Initiate NodeManager
        const nodeManager = new NodeManager();
        nodeManager.setCurrentNode(nodeTree.getRoot());

        const quizContext = new QuizContext(
          CerosSDK,
          experience,
          navDict,
          distributor,
          utils,
          nodeTree,
          nodeManager
        );

        const resetCollection = experience.findLayersByTag("reset");

        const backCollection = experience.findLayersByTag("back");

        const answerCollection = experience.findComponentsByTag("answer");

        const navCollections = experience.findComponentsByTag("nav");

        /**
         * Parse the csv link passed through data attribute on the script. Pass the parsed result to NodeTree
         */
        PapaParse.parse(link, {
          download: true,
          header: true,
          complete: (result) => {
            nodeTree.buildTree(result.data);
          },
        });

        quizContext.setStrategiesBasedOnQuestionName(keys, hidingQuestions);

        // handle back navigation
        backCollection.on(
          CerosSDK.EVENTS.CLICKED,
          quizContext.handleBackNavigation.bind(quizContext)
        );

        resetCollection.on(
          CerosSDK.EVENTS.CLICKED,
          quizContext.resetQuiz.bind(quizContext)
        );

        answerCollection.on(
          CerosSDK.EVENTS.CLICKED,
          quizContext.onAnswerClick.bind(quizContext)
        );

        navCollections.on(
          CerosSDK.EVENTS.CLICKED,
          quizContext.handleRandomNavigation.bind(quizContext)
        );
      })
      .fail(function (e) {
        console.log(e);
      });
  });
})(jQuery);
