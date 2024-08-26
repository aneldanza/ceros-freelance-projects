define(["modules/eventHandler"], function (EventHandler) {
  /**
   * @constructor
   * @param {HTMLElement} node
   * @param {string} name
   */
  function DomObserver(node, name) {
    this.node = node;
    this.name = name;
  }

  /**
   * mutation observer callback
   * @param {MutationRecord[]} mutationsList
   * @param {MutationObserver} observer
   */
  DomObserver.prototype.findVideoPlayer = function (mutationsList, observer) {
    for (var i = 0; i < mutationsList.length; i++) {
      var mutation = mutationsList[i];
      if (mutation.type === "childList") {
        var nodes = mutation.addedNodes;
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].nodeName === "DIV" && node.classList.indexOf("video-js") > -1) {
            observer.disconnect();
            this.player = nodes[i];
            this.setupPlayerSettings();
          }
        }
      }
    }
  };

  /**
   *
   * @param {VideoController} vc
   */
  DomObserver.prototype.updateVideoSettings = function (vc) {
    this.vc = vc;
    var config = { childList: true };

    // check if there is a video-js player
    var playerEl = this.vc.getPlayer(this.name);
    this.player = playerEl || "";

    if (this.player) {
      this.setupPlayerSettings();
    } else {
      // check if the video element is already loaded
      var observer = new MutationObserver(this.findVideoPlayer);
      observer.observe(this.node, config);
    }
  };

  /**
   * add player and it's settings to video controller object
   * init EventHandler to track the video events on the page
   */
  DomObserver.prototype.setupPlayerSettings = function () {
    this.vc.videos[this.name].player = this.player;

    var handler = new EventHandler(this.vc);
    handler.registerPlaybackEvent(this.player, this.name);

    // apply video settings from tags
    this.applyPlayerVideoSettings();
  };

  DomObserver.prototype.applyPlayerVideoSettings = function () {
    var videoSettings = this.vc.videos[this.name].settings;

    videoSettings.forEach(this.setAttributeFunctionality.bind(this));
  };

  /**
   *
   * @param {string} attr
   */
  DomObserver.prototype.setAttributeFunctionality = function (attr) {
    if (attr === "loop") {
      this.player.loop(true);
    } else if (attr === "hide-controls") {
      this.player.controls(false);
      this.player.bigPlayButton.hide();
    }
  };

  return DomObserver;
});
