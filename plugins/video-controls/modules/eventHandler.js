define(function () {
  /**
   * @constructor
   * @param {VideoController} vc
   */
  var EventHandler = function (vc) {
    this.vc = vc;
  };

  /**
   * add event listener for Play event
   * @param {Player} player
   * @param {string} name
   */
  EventHandler.prototype.registerPlaybackEvent = function (player, name) {
    player.on("play", this.handlePlayStart.bind(this, name, player));
  };

  /**
   * Pause all other videos when this one starts to play
   * Register trigger events
   * @param {string} name
   * @param {Player} player
   */
  EventHandler.prototype.handlePlayStart = function (name, player) {
    this.vc.pauseOtherVideos(name);
    var triggerCollection = this.vc.videos[name].triggers;

    if (triggerCollection && triggerCollection.length > 0) {
      triggerCollection.forEach(this.registerTriggers.bind(this, player));
    }
  };

  /**
   * get timestamps from component tags
   * init trigger action for each timestamp
   * @param {Player} player
   * @param {CerosComponent} comp
   */
  EventHandler.prototype.registerTriggers = function (player, comp) {
    var timeStamps = this.vc.getValueArrayFromTags(comp, "at");

    timeStamps.forEach(this.addTriggerAction.bind(this, comp, player));
  };

  /**
   *
   * @param {CerosComponent} comp
   * @param {Player} player
   * @param {string} timestamp
   */
  EventHandler.prototype.addTriggerAction = function (comp, player, timestamp) {
    if (timestamp === "end") {
      this.addTriggerOnVideoEnd(player, comp);
    } else if (!isNaN(timestamp)) {
      this.addTriggerOnTimeInterval(player, comp, timestamp);
    }
  };

  /**
   * Add event listener for 'timeupdate'
   * @param {Player} player
   * @param {CerosComponent} trigger
   * @param {string} seconds
   */
  EventHandler.prototype.addTriggerOnTimeInterval = function (player, trigger, seconds) {
    seconds = Math.round(parseFloat(seconds));

    player.on("timeupdate", this.dispatchEventOnTimeStamp.bind(this, seconds, trigger, player));
  };

  /**
   * trigger programmatic click on the component if the video played past the specified timestamp
   * @param {number} seconds
   * @param {CerosComponent} trigger
   * @param {Player} player
   */
  EventHandler.prototype.dispatchEventOnTimeStamp = function (seconds, trigger, player) {
    if (Math.round(player.currentTime()) == seconds) {
      trigger.click();
    }
  };

  /**
   * Add event listener for 'ended'
   * @param {Player} player
   * @param {CerosComponent} trigger
   */
  EventHandler.prototype.addTriggerOnVideoEnd = function (player, trigger) {
    player.on("ended", this.dispatchEventOnVideoEnded.bind(this, trigger));
  };

  /**
   * trigger programmatic click on the component
   * @param {CerosComponent} trigger
   */
  EventHandler.prototype.dispatchEventOnVideoEnded = function (trigger) {
    trigger.click();
  };

  return EventHandler;
});
