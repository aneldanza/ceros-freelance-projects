(function ($) {
  "use strict";

  const $script = $("#dc-contactor");
  const link = $script.attr("data-link");
  const distributor = $script.attr("data-distributor") || "";

  // Calculate an absolute URL for our modules, so they're not loaded from view.ceros.com if lazy loaded
  let absUrl;
  const srcAttribute = $script.attr("src");

  // Check that a src attibute was defined, and code hasn't been inlined by third party
  if (typeof srcAttribute !== "undefined" && new URL(srcAttribute)) {
    const srcURL = new URL(srcAttribute);
    const path = srcURL.pathname;
    const projectDirectory = path.split("/").slice(0, -1).join("/") + "/";
    absUrl = srcURL.origin + projectDirectory;
  } else {
    absUrl = "./";
  }

  // load CerosSDK via requirejs
  require.config({
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
      PapaParse:
        "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min",
      modules: absUrl + "modules",
    },
  });

  require([
    "CerosSDK",
    "PapaParse",
    "modules/Node",
    "modules/NodeManager",
    "modules/NodeTree",
    "modules/QuizContext",
    "modules/Utils",
  ], function (
    CerosSDK,
    PapaParse,
    Node,
    NodeManager,
    NodeTree,
    QuizContext,
    Utils
  ) {
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

        //Initiate Utils
        const utils = new Utils();

        //Initiate root node
        const root = new Node("Root");

        // Initiate NodeTree
        const nodeTree = new NodeTree(keys);

        // Initiate NodeManager
        const nodeManager = new NodeManager();
        nodeManager.setCurrentNode(root);

        const quizContext = new QuizContext(
          CerosSDK,
          experience,
          keys,
          navDict,
          distributor,
          utils,
          nodeTree,
          nodeManager,
          root
        );
        // Register the handlers on current node change
        nodeManager.addObserver(quizContext.handleNodeChange.bind(quizContext));
        nodeManager.addObserver(quizContext.updatePath.bind(quizContext));

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
            nodeTree.buildTree(result.data, root);
          },
        });

        quizContext.setStrategiesBasedOnQuestionName();

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
