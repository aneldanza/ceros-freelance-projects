/// <reference path="../types/CerosSDK.d.ts" />
/// <reference path="../types/papaparse.d.ts" />

const script = document.getElementById("fuse-holders");

if (script === null) {
  throw Error("Could not find script fuse-holders");
}
const link = script.getAttribute("data-link") || "";
const distributor = script.getAttribute("data-distributor") || "";
const relatedProductsLink = script.getAttribute("data-related-products") || "";
const accessoriesLink = script.getAttribute("data-accessories") || "";

if (typeof require !== "undefined" && typeof require === "function") {
  require.config({
    baseUrl: "http://127.0.0.1:5173/",
    paths: {
      CerosSDK: "//sdk.ceros.com/standalone-player-sdk-v5.min",
      PapaParse:
        "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min",
    },
  });

  require([
    "CerosSDK",
    "PapaParse",
    "modules/QuizContext",
    "modules/NodeTree",
    "modules/constants",
  ], function (
    CerosSDK: CerosSDK,
    PapaParse: typeof window.Papa,
    QuizModule: any,
    NodeTreeModule: any,
    constants: any
  ) {
    CerosSDK.findExperience()
      .done((experience: Experience) => {
        const nodeTree = new NodeTreeModule.NodeTree(constants.fieldNodesDict);

        PapaParse.parse(link, {
          download: true,
          header: true,
          complete: (result: Papa.ParseResult<unknown>) => {
            nodeTree.buildTree(result.data);
            new QuizModule.QuizContext(
              CerosSDK,
              experience,
              nodeTree,
              distributor,
              relatedProductsLink,
              accessoriesLink,
              PapaParse
            );
          },
        });
      })
      .fail((e: any) => {
        console.log(e);
      });
  });
}
