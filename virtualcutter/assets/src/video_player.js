// $Id: video_player.js 269 2011-12-02 09:09:55Z thijs $

// Self-executing function to prevent global vars and help with minification
(function(window, undefined){
  var document = window.document;

// Using jresig's Class implementation http://ejohn.org/blog/simple-javascript-inheritance/
(function(){var initializing=false, fnTest=/xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/; this.Class = function(){}; Class.extend = function(prop) { var _super = this.prototype; initializing = true; var prototype = new this(); initializing = false; for (var name in prop) { prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn){ return function() { var tmp = this._super; this._super = _super[name]; var ret = fn.apply(this, arguments); this._super = tmp; return ret; }; })(name, prop[name]) : prop[name]; } function Class() { if ( !initializing && this.init ) this.init.apply(this, arguments); } Class.prototype = prototype; Class.constructor = Class; Class.extend = arguments.callee; return Class;};})();

var Video = Class.extend({
  // Listeners.
  onProgressUpdateListeners: {
    high : [],
    medium : [],
    low: []
  },
  onProgressUpdateListenerInit: false,
  onMetaDataListeners: [],
  onBufferUpdateListeners: [],
  onPlayListeners: [],
  onPauseListeners: [],
  onStopListeners: [],
  
  // When play is commenced, listen to the end mark and stop there.
  useEndMarkListener: false,

  // Globals.
  element: null,
  config: {
    hideControls: true,
    defaultAspectRatio: 0.5625, // 16:9
  },
  videoSupport: undefined,
  player: null,
  flash: false,
  options: {},

  // When using forward or rewind, use this percentage of the duration.
  skipPercentage: 5,

  init: function(element, config) {
    // Extend configuration.
    $.extend(this.config, config);
    
    this.element = $(element);
    
    if (this.html5VideoSupport() && !config.forceFlash && this.canPlaySource(element)) {
      this.player = new VideoPlayer(element, config, this.options);
      this.resizePlayerArea(this.element.width());
    }
    else {
      config.src = this.retrieveFallbackResource(element);
      this.player = new FlashVideoPlayer(element, config, this.options);
      this.flash = true;
      this.resizePlayerArea(this.element.width());
    }
  },
  
  /**
   * Resize the player's parent element by using the defaultAspectRatio when
   * only width or height is given, or simply resize to the exact given width 
   * and height when provided.
   */
  resizePlayerArea: function(w, h) {
    if (!w && !h) {
      w = 640; // Default to 640 width.
      h = Math.round(w * this.config.defaultAspectRatio);
    }
    if (w && !h) {
      h = Math.round(w * this.config.defaultAspectRatio);
    }
    else if (h && !w) {
      w = Math.round(h / this.config.defaultAspectRatio);
    }
    
    this.element.parent().css({
      width: w,
      height: h
    });
  },

  /**
   * Check if the client browser is able to use a HTML5 player
   */
  html5VideoSupport: function() {
    if (typeof this.videoSupport != "undefined") { return this.videoSupport; }
    this.videoSupport = !!document.createElement('video').canPlayType;
    return this.videoSupport;
  },
  
  // Browser & device Checks, borrow those from VideoJS.
  isIE: VideoJS.isIE,
  isIPad: VideoJS.isIPad,
  isIPhone: VideoJS.isIPhone,
  isIOS: VideoJS.isIOS,
  iOSVersion: VideoJS.iOSVersion,
  isAndroid: VideoJS.isAndroid,
  androidVersion: VideoJS.androidVersion,
  
  // Checks child elements of a <video> tag checking for support for any of the
  // mentioned sources.
  canPlaySource: function(videoElement) {
    // Cache Result.
    if (this.canPlaySourceResult) { return this.canPlaySourceResult; }
    // Loop through sources and check if any can play.
    var children = videoElement.children;
    for (var i=0,j=children.length; i<j; i++) {
      if (children[i].tagName.toUpperCase() == "SOURCE") {
        var canPlay = videoElement.canPlayType(children[i].type) || this.canPlayExt(children[i].src);
        if (canPlay == "probably" || canPlay == "maybe") {
          this.firstPlayableSource = children[i];
          this.canPlaySourceResult = true;
          return true;
        }
      }
    }
    this.canPlaySourceResult = false;
    return false;
  },
  
  // Retrieves the first mp4-like source for use in the Flash fallback.
  retrieveFallbackResource: function(videoElement) {
    if ($(videoElement).data('fallback')) {
      return $(videoElement).data('fallback');
    }
    var children = videoElement.children;
    for (var i=0,j=children.length; i<j; i++) {
      if (children[i].tagName.toUpperCase() == "SOURCE" && children[i].type.match(/(video|audio)\/(mp(2|3|4)|m4v)/i)) {
        return children[i].src;
      }
    }
    return false;
  },
  
  // Check if the extention is compatible, for when type won't work
  canPlayExt: function(src) {
    if (!src) { return ""; }
    var match = src.match(/\.([^\.]+)$/);
    if (match && match[1]) {
      var ext = match[1].toLowerCase();
      // Android canPlayType doesn't work
      if (this.isAndroid()) {
        if (ext == "mp4" || ext == "m4v") { return "maybe"; }
      // Allow Apple HTTP Streaming for iOS
      } else if (this.isIOS()) {
        if (ext == "m3u8") { return "maybe"; }
      }
    }
    return "";
  },

  /**
   * Start video.
   */
  play: function() {
    this.useEndMarkListener = false;
    this.player.play();
  },

  /**
   * Pause video.
   */
  pause: function() {
    this.player.pause();
  },

  /**
   * Start or pause video based on state.
   */
  playToggle: function() {
    if (this.player.isPaused() || this.player.isStopped()) {
      this.play();
    }
    else {
      this.pause();
    }
  },

  /**
   * This method checks to see if the video is paused.
   */
  isPaused: function() {
    return this.player.isPaused();
  },
  
  /**
   * Checks if the video is stopped/has reached its original end.
   */
  isStopped: function() {
    return this.player.isStopped();
  },

  /**
   * A method for quickly skipping forward trough a video.
   */
  forwardVideo: function() {
    this.player.playAt(this.player.currentTime() + ((this.skipPercentage / 100) * this.getDuration()));
  },

  /**
   * A method for quickly skipping backwords trough a video.
   */
  rewindVideo: function() {
    this.player.playAt(this.player.currentTime() - ((this.skipPercentage / 100) * this.getDuration()));
  },

  /**
   * A method to set the volume
   *
   * volume - Set a round value between 0 and 100.
   */
  setVolume: function(volume) {
    this.player.setVolume(volume);
  },

  /**
   * A method to get the current volume level.
   */
  getVolume: function() {
    return this.player.getVolume();
  },

  /**
   * A method to check if a video has been playing.
   */
  hasPlayed: function() {
    return this.player.hasPlayed();
  },

  /**
   * A method to get the current time
   */
  getTime: function() {
    return this.player.currentTime();
  },

  setStartMark: function(time) {
    this.player.options.startMark = time;

    // Notify player.
    this.player.updateStartMarker(this.player.options.startMark);
  },

  setEndMark: function(time) {
    this.player.options.endMark = time;
    // Notify player.
    this.player.updateEndMarker(this.player.options.endMark);
  },

  /**
   * A method for retrieving the total duration.
   */
  getDuration: function() {
    return this.player.getDuration();
  },

  onPlay: function(fn) {
    // If the listener has not been configured yet, do it.
    if (this.onPlayListeners.length == 0) {
      this.player.onPlay(this);
    }
    // Add listener to array.
    this.onPlayListeners.push(fn)

    return this;
  },

  triggerOnPlayListeners: function(time) {
    this.each(this.onPlayListeners, function(fn) {
      fn(time);
    });
  },

  onPause: function(fn) {
    // Add listener to array.
    this.onPauseListeners.push(fn)

    // If the listener has not been configured yet, do it.
    if (this.onPauseListeners.length == 1) {
      this.player.onPause(this);
    }

    return this;
  },
  
  // @todo Is it an option to use a for loop instead of each?
  triggerOnPauseListeners: function() {
    this.each(this.onPauseListeners, function(fn) {
      fn();
    });
  },
  
  onStop: function(fn) {
    this.onStopListeners.push(fn);
    if (this.onStopListeners.length == 1) {
      this.player.onStop(this);
    }
  },
  
  triggerOnStopListeners: function() {
    this.each(this.onStopListeners, function(fn) {
      fn();
    });
  },

  onProgressUpdate: function(fn, priority) {
    // Fill priority lists
    switch (priority) {
      case 'high':
        // Add listener to array
        this.onProgressUpdateListeners.high.push(fn)
        break;
      case 'medium':
        // Add listener to array
        this.onProgressUpdateListeners.medium.push(fn)
        break;
      case 'low':
        // Add listener to array
        this.onProgressUpdateListeners.low.push(fn)
        break;
    }

    // If the listener has not been configured yet, do it.
    if (!this.onProgressUpdateListenerInit) {
      this.player.onProgressUpdate(this);
      this.onProgressUpdateListenerInit = true;
    }

    return this;
  },
  
  // @todo Is it an option to use a for loop instead of each?
  triggerOnProgressUpdateListeners: function(time, priorities) {
    var that = this;
    this.each(priorities, function(prio) {
      that.each(that.onProgressUpdateListeners[prio], function(fn) {
        fn(time);
      });
    });
  },

  onMetaData: function(fn) {
    // If the listener has not been configured yet, do it.
    if (this.onMetaDataListeners.length == 0) {
      // Add listener to array.
      this.onMetaDataListeners.push(fn);
      // Add event.
      this.player.onMetaData(this);
      return this;
    }
    // Add listener to array.
    this.onMetaDataListeners.push(fn);

    return this;
  },

  triggerOnMetaDataListeners: function() {
    this.each(this.onMetaDataListeners, function(fn) {
      fn();
    });
  },

  onBufferUpdate: function(fn) {
    // If the listener has not been configured yet, do it.
    if (this.onBufferUpdateListeners.length == 0) {
      this.player.onBufferUpdate(this);
    }
    // Add listener to array.
    this.onBufferUpdateListeners.push(fn)

    return this;
  },
  
  // @todo Is it an option to use a for loop instead of each?
  triggerOnBufferUpdateListeners: function(buffered) {
    this.each(this.onBufferUpdateListeners, function(fn) {
      fn(buffered);
    });
  },

  /**
   * Helper method for looping trough arrays
   */
  each: function(arr, fn){
    if (!arr || arr.length === 0) { return; }
    for (var i=0,j=arr.length; i<j; i++) {
      if (fn.call(this, arr[i], i)) { break; }
    }
  }
});

// Expose to global
window.Video = window._VP_ = Video;

// End self-executing function
})(window);
