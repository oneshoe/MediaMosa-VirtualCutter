// $Id: video_player.flash.js 267 2011-12-01 16:37:37Z thijs $

var FlashVideoPlayer = VideoPlayer.extend({
  el: null,
  config: null,
  stoppedAtEndMark: false,
  updateTime: null,
  updateBufferTime: null,
  lastProgressListenerUpdate: {
    high: [],
    medium: [],
    low: []
  },
  duration: null,
  
  isEnded: false,

  init: function(element, config, options){
    this.el = element;
    this.config = config;
    this.options = options;

    var playerConf = {
      plugins: {},
      version: [9, 115],
      clip: {
        autoPlay: false,
        autoBuffering: true,
        seekableOnBegin: true,
        url: config.src,
        rangeRequests: true
      }
    };

    this.videoPlayer = {};

    if (this.hideControls) {
      playerConf.plugins.controls = null;
      playerConf.play = null;
    }

    this.config.playerConfig = playerConf;

    this.videoPlayer = $f(this.el.parentNode, config.basePath + '/src/flowplayer/flowplayer-3.2.7.swf', playerConf).load();
  },

  /**
   * A method to start a Flowplayer video element at a givin starting point
   *
   * startOffset - start time in seconds
   */
  playAt: function(time, setEndMarkListener) {
    if (setEndMarkListener) {
      this.useEndMarkListener = true;
    }

    // Reset progressListener updates.
    this.lastProgressListenerUpdate = {
      low: 0,
      medium: 0
    };
    // Pause vid first, to prevent issues.
    this.pause();
    this.videoPlayer.play().seek(time);
  },

  /**
   * Sets the volume to the given level.
   *
   * @param volume Set a round value between 0 and 100.
   */
  setVolume: function(volume) {
    this.videoPlayer.setVolume(volume);
  },
  
  setCurrentTime: function(time) {
    this.videoPlayer.seek(time);
  },

  /**
   * Gets the current volume level.
   */
  getVolume: function() {
    return this.videoPlayer.getVolume();
  },

  /**
   * Indicates if a VideoJS video element is paused.
   */
  isPaused: function() {
    if (this.videoPlayer.getState() == 1) {
      return true;
    }

    return this.videoPlayer.isPaused();
  },
  
  /**
   * Indicates whether video playback has reached it's end.
   */
  isStopped: function() {
    return (this.videoPlayer.getState() == 5);
  },

  /**
   * A method to aquiring the current track time
   */
  currentTime: function() {
    return this.videoPlayer.getTime();
  },

  /**
   * A method for retrieving the total duration of the clip.
   */
  getDuration: function() {
    if (this.duration == null) {
      this.duration = this.videoPlayer.getClip().fullDuration;
    }
    return this.duration;
  },

  /**
   * A method to check if a video has been playing
   */
  hasPlayed: function() {
     return (this.videoPlayer.getState() > 1 && this.videoPlayer.getTime() > 0.5) ? true: false;
  },

  /**
   * Update start marker.
   */
  updateStartMarker: function(time) {
    this.options.startMark = time;
  },

  /**
   * Update end marker.
   */
  updateEndMarker: function(endMark) {
    this.options.endMark = endMark;
  },

  /**
   * Attaches an onResume event handler.
   */
  onPlay: function(context) {
    var that = this;
    this.videoPlayer.onResume(function() {
      that.isEnded = false;
      context.triggerOnPlayListeners();
    });
    this.videoPlayer.onStart(function() {
      that.isEnded = false;
      context.triggerOnPlayListeners();
    });
  },
  
  /**
   * Attaches an onPause event handler.
   */
  onPause: function(context) {
    var that = this;
    if (!this.hasPlayed()) {
      context.triggerOnPauseListeners();
    }
    this.videoPlayer.onPause(function() {
      that.isEnded = false;
      context.triggerOnPauseListeners();
    });
  },
  
  /**
   * Attaches an onStop event handler.
   */
  onStop: function(context) {
    var that = this;
    this.videoPlayer.onFinish(function() {
      that.isEnded = true;
      context.triggerOnStopListeners();
    });
  },

  /**
   * onProgressUpdate listener
   */
  onProgressUpdate: function(context) {
    var that = this;
    var priorities = [];

    this.videoPlayer.onResume(function() {
      that.lastProgressListenerUpdate.medium = 0;
      that.lastProgressListenerUpdate.low = 0;
      // Begin timer.
      that.updateTime = setInterval(function()  {
        var time = that.currentTime();
        if (that.stoppedAtEndMark && time < that.options.endMark) that.stoppedAtEndMark = false;
        if (that.useEndMarkListener && !that.stoppedAtEndMark && time >= that.options.endMark) {
          that.videoPlayer.pause();
          that.stoppedAtEndMark = true;
        }

        priorities = [];
        priorities.push('high');

        if ((that.lastProgressListenerUpdate.medium + 0.5) <= time) {
          priorities.push('medium');
          that.lastProgressListenerUpdate.medium = time;
        }

        if ((that.lastProgressListenerUpdate.low + 1) <= time) {
          priorities.push('low');
          that.lastProgressListenerUpdate.low = time;
        }

        context.triggerOnProgressUpdateListeners(time, priorities);
      }, 100);
    });
    
    this.videoPlayer.onStart(function() {
      that.lastProgressListenerUpdate.medium = 0;
      that.lastProgressListenerUpdate.low = 0;

      // Begin timer.
      that.updateTime = setInterval(function() {
        var time = that.currentTime();
        if (that.stoppedAtEndMark && that.currentTime() < that.options.endMark) that.stoppedAtEndMark = false;
        if (that.useEndMarkListener && !that.stoppedAtEndMark && that.currentTime() >= that.options.endMark) {
          that.videoPlayer.pause();
          that.stoppedAtEndMark = true;
        }

        priorities = [];
        priorities.push('high');

        if ((that.lastProgressListenerUpdate.medium + 0.5) <= time) {
          priorities.push('medium');
          that.lastProgressListenerUpdate.medium = time;
        }

        if ((that.lastProgressListenerUpdate.low + 1) <= time) {
          priorities.push('low');
          that.lastProgressListenerUpdate.low = time;
        }
      }, 200);
    });
    
    this.videoPlayer.onPause(function() {
      clearInterval(that.updateTime);
    });
    
  },

  onMetaData: function(context) {
    this.videoPlayer.onStart(function() {
      context.triggerOnMetaDataListeners();
    });
  },

  onBufferUpdate: function(context) {
    var that = this;

    this.videoPlayer.onStart(function() {
      that.updateBufferTime = setInterval(function() {
        status = that.videoPlayer.getStatus();
        context.triggerOnBufferUpdateListeners(status.bufferEnd);
        if (status.bufferEnd >= that.videoPlayer.getClip().duration) {
          clearInterval(that.updateBufferTime);
        }
      }, 500);
    });
  }
});
