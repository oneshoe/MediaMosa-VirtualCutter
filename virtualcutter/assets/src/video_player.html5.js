// $Id: video_player.html5.js 263 2011-11-30 19:01:05Z thijs $

// Using jresig's Class implementation http://ejohn.org/blog/simple-javascript-inheritance/
(function(){var initializing=false, fnTest=/xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/; this.Class = function(){}; Class.extend = function(prop) { var _super = this.prototype; initializing = true; var prototype = new this(); initializing = false; for (var name in prop) { prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn){ return function() { var tmp = this._super; this._super = _super[name]; var ret = fn.apply(this, arguments); this._super = tmp; return ret; }; })(name, prop[name]) : prop[name]; } function Class() { if ( !initializing && this.init ) this.init.apply(this, arguments); } Class.prototype = prototype; Class.constructor = Class; Class.extend = arguments.callee; return Class;};})();

var VideoPlayer = Class.extend({
  // Set globals
  el: null,
  config: null,
  playerConf: null,
  player: null,
  options: {},
  stoppedAtEndMark: false,
  endMark: 0,
  startMark: 0,
  hasEndMarkListener: null,

  lastProgressListenerUpdate: {
    low: 0,
    medium: 0
  },
  
  isEnded: false,

  // Init controls global.
  controls: [],

  /**
   * This method provides initialization of the Video object and player 
   * configuration.
   */
  init: function(element, config, options) {
    // Set element to object
    this.el = element;
    // Set videoJS config
    this.config = config;
    // Fill options
    this.options = options;

    // To prevent VideoJS from rendering HTML and executing functions for the 
    // controls, we tell it to use the browser controls.
    if (this.config.hideControls) {
      this.config.playerConf.useBuiltInControls = true;
    }

    // Creat new VideoJS player.
    this.videoPlayer = new VideoJS(this.el, this.config.playerConf);

    // Manually remove build-in browser controls.
    if (this.config.hideControls) {
      this.hideControls();
    }
  },


  /**
   *  This method will hide all of the UI components of the VideoJS player.
   */
  hideControls: function() {
    // set all control bars to null, to prevent display
    this.videoPlayer.video.controls = false;
  },

  /**
   * A method to start a VideoJS video element
   */
  play: function() {
    this.videoPlayer.play();
  },

  /**
   * A method to pause a VideoJS video element
   */
  pause: function() {
    this.videoPlayer.pause();
  },

  /**
   * A method to start a VideoJS video element at a givin starting point.
   *
   * startOffset - start time in seconds
   */
  playAt: function(startOffset, setEndMarkListener) {
    if (setEndMarkListener) {
      this.useEndMarkListener = true;
    }

    // Reset listeners
    this.lastProgressListenerUpdate = {
      low: 0,
      medium: 0
    };
    
    if (!this.hasPlayed()) {
      if (this.videoPlayer.video.readyState > 0) {
        this.setCurrentTime(startOffset, true);
        this.videoPlayer.play();
      }
    }
    else {
      this.setCurrentTime(startOffset, true);
      this.videoPlayer.play();
    }
    
    // If a listener has been created.
    if (this.hasEndMarkListener != null) {
      return;
    }

    // Bind listener if necessary.
    var that = this;
    this.videoPlayer.onCurrentTimeUpdate(function(time) {
      if (!that.stoppedAtEndMark && (time >= that.endMark) && (time < (parseInt(that.endMark) + 1))) {
        that.videoPlayer.pause();
        that.stoppedAtEndMark = true;
      }
      that.hasEndMarkListener = true;
    });
  },
  
  setCurrentTime: function(time, prepareForPlayAt) {
    var children = this.el.children, src;
    for (var i=0,j=children.length; i<j; i++) {
      if (children[i].tagName.toUpperCase() == "SOURCE") {
        src = children[i].src;
        if (src.indexOf('#') != -1) {
          src = src.substring(0, src.indexOf('#'));
        }
        if (time) src = src + '#t=' + time;
        children[i].src = src;
      }
    }
    if (prepareForPlayAt) this.videoPlayer.currentTime(time);
  },

  /**
   * A method to stop a VideoJS video element
   */
  stop: function() {
    this.videoPlayer.pause();
    this.setCurrentTime(0, true);
  },

  /**
   * A method to set the volume
   *
   * volume - Set a round value between 0 and 100
   */
  setVolume: function(volume) {
    this.videoPlayer.volume(volume / 100);
  },

  /**
   * A method to get the current volume level
   */
  getVolume: function() {
    return (this.videoPlayer.values.volume * 100);
  },

  /**
   * A method to indicate if a VideoJS video element is playing
   */
  isPaused: function() {
    return this.videoPlayer.paused();
  },
  
  /**
   * Returns whether or not the video is stopped.
   */
  isStopped: function() {
    return this.isEnded;
  },

  /**
   * A method to aquiring the current track time
   */
  currentTime: function() {
    return this.videoPlayer.currentTime();
  },

  /**
   * A method for retrieving the total duration
   */
  getDuration: function() {
    return this.videoPlayer.video.duration;
  },

  /**
   * A method to check if a video has been playing
   */
  hasPlayed: function() {
    if (this.videoPlayer.hasPlayed == undefined) {
      return false;
    }
    else {
      return true;
    };
  },

  /**
   * Update start markers
   */
  updateStartMarker: function(time) {
    this.startMark = time;
    this.setCurrentTime(time);
  },

  /**
   * Update end markers
   */
  updateEndMarker: function(endMark) {
    // Override endMark
    this.endMark = endMark;

    // If a listener has been created.
    if (this.hasEndMarkListener != null) {
      return;
    }

    // Bind listener if necessary.
    var that = this;
    this.videoPlayer.onCurrentTimeUpdate(function(time) {
      if (!that.stoppedAtEndMark && (time >= that.endMark) && (time < (parseInt(that.endMark) + 1))) {
        that.videoPlayer.pause();
        that.stoppedAtEndMark = true;
      }
      that.hasEndMarkListener = true;
    });
  },

  /**
   * Attaches an onResume event handler.
   */
  onPlay: function(context) {
    this.videoPlayer.onPlay(function() {
      context.triggerOnPlayListeners();
    });
  },

  /**
   * Attaches an onPause event handler.
   */
  onPause: function(context) {
    if (!this.hasPlayed()) {
      context.triggerOnPauseListeners();
    }
    this.videoPlayer.onPause(function() {
      context.triggerOnPauseListeners();
    });
  },
  
  /**
   * Attaches an onStop event handler.
   */
  onStop: function(context) {
    this.videoPlayer.onEnded(function() {
      context.triggerOnStopListeners();
    });
  },

  /**
   * onProgressUpdate listener
   */
  onProgressUpdate: function(context) {
    var that = this;
    var priorities = [];

    this.videoPlayer.onCurrentTimeUpdate(function(time) {
      priorities = ['high'];

      if ((that.lastProgressListenerUpdate.medium + 0.5) <= time) {
        priorities.push('medium');
        that.lastProgressListenerUpdate.medium = time;
      }

      if ((that.lastProgressListenerUpdate.low + 1) <= time) {
        priorities.push('low');
        that.lastProgressListenerUpdate.low = time;
      }

      context.triggerOnProgressUpdateListeners(time, priorities);
    });
  },

  onMetaData: function(context) {
    // The loadedmetadata event doesn't get triggered consistently, therefor we 
    // check for ready state first, and immediately fire the custom event.
    if (this.videoPlayer.video.readyState >= 1) {
      context.triggerOnMetaDataListeners();
      return;
    }
    // Add listener plus IE check.
    if (this.videoPlayer.video.addEventListener) {
      this.videoPlayer.video.addEventListener('loadedmetadata', function() {
        context.triggerOnMetaDataListeners();
      });
    }
    else {
      this.videoPlayer.video.attachEvent('onloadedmetadata', function() {
        context.triggerOnMetaDataListeners();
      });
    }
  },

  onBufferUpdate: function(context) {
    var that = this;
    this.videoPlayer.onBufferedUpdate(function() {
      context.triggerOnBufferUpdateListeners(that.videoPlayer.buffered()[1]);
    });
  }
});
