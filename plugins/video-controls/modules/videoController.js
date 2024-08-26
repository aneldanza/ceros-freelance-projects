define(["modules/domObserver"], function (DomObserver) {
  /**
   * @constructor
   * @param {CerosComponentsCollection} componentsCollection
   * @param {CerosExperience} experience
   * @param {EventHandler} EventHandler
   */
  var VideoController = function (componentsCollection, experience, EventHandler) {
    this.videoComponents = componentsCollection.components;
    this.experience = experience;
    this.EventHandler = EventHandler;

    /**
     * @var {Object} video config objects indexed by video names
     * each video config has component id, settings array, triggers array relevant to the video */
    this.videos = {};

    /**
     * @var {Object} arrays of all studio components that are set to act as video controls
     * each key-value pair is event name - object with SDKCopmponents indexed by video name */
    this.controls = {};

    /**
     * @var {Object} arrays of trigger keys, each video has, indexed by a video name
     * each trigger is a SDKComponent (hotspot)
     */
    this.triggers = {};

    /**
     * @var {Object} arrays of all pending events indexed by video name
     * each pending event is a string. For example: ["play", "mute"]
     */
    this.pendingCommands = {};

    this.getControls();
    this.getTriggers();

    this.videoComponents.forEach(this.initVideoConfig.bind(this));
  };

  /**
   * creates and stores a video config object
   * calls findVideoContainer method
   * @param {CerosComponent} comp
   */
  VideoController.prototype.initVideoConfig = function (comp) {
    var name = this.getValueArrayFromTags(comp, "name")[0];
    var settings = this.getValueArrayFromTags(comp, "do");

    this.videos[name] = {
      id: comp.id,
      settings: settings,
      triggers: this.triggers[name],
    };

    this.findVideoContainer(comp, name);
  };

  /**
   * find all components with tag 'trigger'
   * get the trigger settings from each component and assign them to corresponding video config
   */
  VideoController.prototype.getTriggers = function () {
    var allTriggers = this.experience.findComponentsByTag("trigger");

    allTriggers.components.forEach(
      function (trigger) {
        var name = this.getValueArrayFromTags(trigger, "target")[0];
        this.triggers[name] = this.triggers[name] || [];
        this.triggers[name].push(trigger);
      }.bind(this)
    );
  };

  /**
   * find all components with tag 'video-control'
   * get the event type and video name from each component
   * add each component to this.controls object indexed by event type and vide name
   */
  VideoController.prototype.getControls = function () {
    // Find control hotspots for toggle-playback, toggle-mute, pause, play
    var allControls = this.experience.findComponentsByTag("video-control");

    allControls.components.forEach(
      function (comp) {
        var target = this.getValueArrayFromTags(comp, "target")[0];
        var event = this.getValueArrayFromTags(comp, "event")[0];

        this.controls[event] = this.controls[event] || {};
        this.controls[event][target] = comp;
      }.bind(this)
    );
  };

  /**
   * Set up interval to search and register video container element in video controller object
   * @param {CerosComponent} comp
   * @param {string} name
   */
  VideoController.prototype.findVideoContainer = function (comp, name) {
    var interval = setInterval(
      function () {
        var videoContainer = document.getElementById(comp.id);
        if (videoContainer) {
          clearInterval(interval);
          this.videos[name].container = videoContainer;
          this.triggerPendingCommands(name);

          // add video player to video controller object and register video settings specified in tags in the studio (do:hide-controls, trigger:end, etc.)
          var observer = new DomObserver(videoContainer, name);
          observer.updateVideoSettings(this);
        }
      }.bind(this),
      100
    );
  };

  /**
   * gets values from key-value pairs in component's tags
   * @param {CerosComponent} comp
   * @param {string} key
   * @returns {string[]}
   */
  VideoController.prototype.getValueArrayFromTags = function (comp, key) {
    var tags = comp.getTags();
    var arr = [];
    var delimeter = ":";

    for (var i = 0; i < tags.length; i++) {
      var tag = tags[i];
      if (tag.indexOf(key + delimeter) > -1) {
        var value = tag.split(delimeter)[1];
        arr.push(value.trim());
      }
    }

    return arr;
  };

  /**
   * get Player element by video name
   * @param {string} name
   * @returns {Player | null}
   */
  VideoController.prototype.getPlayer = function (name) {
    if (this.videos.hasOwnProperty(name) && this.videos[name].player) {
      return this.videos[name].player;
    }

    // if the player was not added to video controller, find it in the DOM
    try {
      var videoContainer = this.videos[name].container;
      if (videoContainer) {
        return this.storePlayer(videoContainer, name);
      }
      return null;
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * find video player element in video container node
   * store player in video config object
   * @param {HTMLElement} node
   * @param {string} name
   * @returns {Player | undefined}
   */
  VideoController.prototype.storePlayer = function (node, name) {
    var contentsArray = node.children;
    for (var i = 0; i < contentsArray.length; i++) {
      var el = contentsArray[i];

      if (el.nodeName === "DIV" && el.classList.contains("video-js")) {
        this.videos[name].player = el.player;
        return el.player;
      }
    }
  };

  /**
   *
   * @param {Player} player
   */
  VideoController.prototype.playVideo = function (player) {
    player.play();
  };

  /**
   *
   * @param {string} name
   */
  VideoController.prototype.muteVideoByName = function (name) {
    var player = this.getPlayer(name);
    player.muted(true);
  };

  /**
   *
   * @param {Player} player
   */
  VideoController.prototype.pauseVideo = function (player) {
    player.pause();
  };

  /**
   *
   * @param {Player} player
   */
  VideoController.prototype.toggleMute = function (player) {
    player.muted(!player.muted());
  };

  /**
   *
   * @param {Player} player
   */
  VideoController.prototype.togglePlayback = function (player) {
    if (player.paused()) {
      this.playVideo(player);
    } else {
      this.pauseVideo(player);
    }
  };

  /**
   *
   * @param {Player} player
   */
  VideoController.prototype.resetVideo = function (player) {
    player.currentTime(0);
    this.pauseVideo(player);
  };

  /**
   * pause all available videos in the DOM
   */
  VideoController.prototype.pauseAllVideos = function () {
    for (var name in this.videos) {
      var player = this.getPlayer(name);
      if (player && player.ready) {
        this.pauseVideo(player);
      }
    }
  };

  /**
   * Pause all videos, but the video with the name in target variable
   * @param {string} target
   */
  VideoController.prototype.pauseOtherVideos = function (target) {
    for (var name in this.videos) {
      if (name !== target) {
        var player = this.videos[name].player;
        if (player && !player.paused()) {
          // click on video control hotspot to trigger on-click interactions if available
          if (this.hasVideoControl("toggle-playback", name)) {
            this.clickControl("toggle-playback", name);
          } else if (this.hasVideoControl("pause", name)) {
            this.clickControl("pause", name);
          } else {
            this.pauseVideo(player);
          }
        }
      }
    }
  };

  /**
   * check if the video has a video control with the event type
   * @param {string} event
   * @param {string} name
   * @returns {boolean}
   */
  VideoController.prototype.hasVideoControl = function (event, name) {
    var eventRef = this.controls[event];
    return !!eventRef[name];
  };

  /**
   * trigger programmatic click on video control hotspot
   * @param {string} event
   * @param {string} name
   */
  VideoController.prototype.clickControl = function (event, name) {
    var eventRef = this.controls[event];
    eventRef[name].click();
  };

  /**
   *
   * @param {Player} player
   * @param {string} event
   */
  VideoController.prototype.triggerEvent = function (player, event) {
    try {
      switch (event) {
        case "play": {
          this.playVideo(player);
          break;
        }
        case "pause": {
          this.pauseVideo(player);
          break;
        }
        case "toggle-mute": {
          this.toggleMute(player);
          break;
        }
        case "toggle-playback": {
          this.togglePlayback(player);
          break;
        }
        case "reset": {
          this.resetVideo(player);
          break;
        }
        case "pause-all": {
          this.pauseAllVideos();
          break;
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Trigger event type of store the event in pending commands object if the player is not found
   * @param {Player} player
   * @param {string} name
   * @param {string} event
   */
  VideoController.prototype.registerEvent = function (player, name, event) {
    if (player === null) {
      this.pendingCommands[name] = this.pendingCommands[name] || [];
      this.pendingCommands[name].push(event);
    } else if (player) {
      this.triggerEvent(player, event);
    }
  };

  /**
   *
   * @param {CerosComponent} comp
   */
  VideoController.prototype.dispatchEvent = function (comp) {
    var event = this.getValueArrayFromTags(comp, "event")[0];
    var name = this.getValueArrayFromTags(comp, "target")[0];

    if (event === "pause-all") {
      this.pauseAllVideos();
    } else {
      var player = this.getPlayer(name);
      this.registerEvent(player, name, event);
    }
  };

  /**
   *
   * @param {string} name
   * @returns
   */
  VideoController.prototype.triggerPendingCommands = function (name) {
    var player = this.getPlayer(name);

    if (!player) {
      return;
    }

    var pendingCommands = this.pendingCommands[name];

    if (pendingCommands && pendingCommands.length > 0) {
      var commands = pendingCommands.slice();
      commands.forEach(this.triggerEvent.bind(this, player));
    }
  };

  /**
   * check if video is currently playing
   * legacy function
   * keeping it in case player.paused() proves to be inefficient
   * @param {Player} video
   * @returns {boolean}
   */
  VideoController.prototype.isPlaying = function (video) {
    if (video.readyState) {
      return !!(video.currentTime > 0 && !video.seeking && !video.paused && !video.ended && video.readyState > 2);
    } else {
      return !!(video.currentTime > 0 && !video.seeking && !video.paused && !video.ended);
    }
  };

  return VideoController;
});
