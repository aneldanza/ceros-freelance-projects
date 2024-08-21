define(["modules/LandingPageProxy"], function (LandingPageProxy) {
  class ResultHandler {
    constructor(experience, CerosSDK, nodeManager, distributor, utils) {
      this.experience = experience;
      this.CerosSDK = CerosSDK;
      this.nodeManager = nodeManager;
      this.resultModules = {};
      this.distributor = distributor;
      this.utils = utils;
      this.landingPageProxy = new LandingPageProxy();
    }

    showResultModule(type) {
      this.updateModuleResults(type);

      const moduleResultHotspot = this.experience.findComponentsByTag(
        `module-${type}`
      );
      moduleResultHotspot.click();
    }

    updateModuleResults(type) {
      this.nodeManager.getCurrentNode().children.forEach((node, index) => {
        const moduleTag =
          type > 1 ? `${type}-module-${index + 1}` : `${type}-module`;
        const module = this.experience.findLayersByTag(moduleTag);
        const collection = module.layers[0].findAllComponents();
        const layersDict = collection.layersByTag;

        const data = node.data;
        const size = type.toString();
        if (
          Object.hasOwn(this.resultModules, size) &&
          this.resultModules[size][moduleTag]
        ) {
          this.resultModules[size] = this.resultModules[size] || {};
          this.resultModules[size][moduleTag] = data;
        } else {
          this.resultModules[size] = this.resultModules[size] || {};
          this.resultModules[size][moduleTag] = data;

          layersDict.images &&
            this.showResultImage(
              moduleTag,
              this.handleModuleImage,
              layersDict.images
            );

          layersDict.icons &&
            this.showResultImage(
              moduleTag,
              this.handleModuleIcon,
              layersDict.icons
            );

          layersDict.part &&
            this.updateResultTextbox("part", moduleTag, layersDict.part);

          layersDict.features &&
            this.updateResultTextbox(
              "features",
              moduleTag,
              layersDict.features
            );

          layersDict.datasheet &&
            this.registerResultClcikEvent(
              layersDict.datasheet,
              "datasheet",
              moduleTag
            );

          layersDict["buy-now"] &&
            this.registerResultClcikEvent(
              layersDict["buy-now"],
              this.distributor,
              moduleTag
            );

          layersDict.specs &&
            this.updateResultTextbox("specs", moduleTag, layersDict.specs);
        }

        console.log(this.resultModules);
      });
    }

    showResultImage(moduleTag, callback, imgArray) {
      imgArray.forEach((layer) => {
        layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (group) => {
          const type = moduleTag.split("-")[0];
          const obj = this.resultModules[type][moduleTag];
          const images = group.findAllComponents();
          images.layers.forEach((img) => callback(img, obj));
        });
      });
    }

    updateResultTextbox(key, moduleTag, txtboxArray) {
      txtboxArray.forEach((layer) => {
        layer.on(this.CerosSDK.EVENTS.ANIMATION_STARTED, (txtBox) => {
          const type = moduleTag.split("-")[0];
          const obj = this.resultModules[type][moduleTag];
          txtBox.setText(obj[key]);
        });
      });
    }

    registerResultClcikEvent(layerArray, key, moduleTag) {
      layerArray.forEach((layer) => {
        layer.on(this.CerosSDK.EVENTS.CLICKED, () => {
          const type = moduleTag.split("-")[0];
          const obj = this.resultModules[type][moduleTag];

          this.landingPageProxy.openAndTrackLink(
            obj[key],
            this.utils.isDoubleClickBug.bind(this.utils)
          );
        });
      });
    }

    handleModuleIcon(icon, data) {
      if (
        data["application"]
          .toLowerCase()
          .includes(icon.getPayload().toLowerCase())
      ) {
        icon.show();
      } else {
        icon.hide();
      }
    }

    handleModuleImage(img, data) {
      const tag = data["image"].split(".")[0].trim();
      if (tag.toLowerCase() === img.getPayload().toLowerCase()) {
        img.show();
      } else {
        img.hide();
      }
    }
  }

  return ResultHandler;
});
