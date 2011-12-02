// $Id: virtualcutter.js 267 2011-12-01 16:37:37Z thijs $

window.onload = function() {
  // DOM is ready for VideoJS
  // @todo Check if $(document).ready(func) is enough?

  var VirtualCutter = {
    // Set globals
    configuration: null,
    element: null,
    controls: null,
    controlsElements: {},
    duration: null,
    startMark: 0,
    endMark: null,
    initMarksAtStart: false,
    volumeLevel: 0,
    hasMetaData: false,

    // Initialization
    init: function(element, configuration) {
      // Allow an ID string or an element
      if (typeof element == 'string') {
        this.element = $(element)[0];
      }
      else {
        this.element = element;
      }

      // If the player element could not be found, there is no reason to continue.
      if (this.element == null) {
        return;
      }
      
      this.setLoading();

      // Set configuration params.
      this.configuration = configuration;
      
      // Create a new video object for the first video object found in the 
      // given element.
      this.player = new Video($('video', this.element)[0], this.configuration);

      // Lookup player controls area.
      this.controls = $(this.element).find('.vc-controls')[0];

      // Configure time markers.
      this.configureMarkerInput();

      // Build controls.
      this.buildControls();

      // Extract information from fragment string.
      var hashParts = location.hash.substring(1).split('t=');
      // Check if the timemarkers are set and split
      if (hashParts.length > 1) {
        var marks = hashParts[1].split(',');

        // Set a start mark and optionally an endmark.
        this.startMark = marks[0];
        if (marks.length > 1) {
          this.endMark = marks[1];
        }
        this.initMarksAtStart = true;
      }
      else {
        this.updateLinks();
      }

      // Configure listeners.
      this.configureListeners();
    },

    // Generate controls elements.
    buildControls: function() {
      // Build the play control
      this.controlsElements.playControl = _V_.createElement("div", { className: "vc-play-control control-button", innerHTML: "<span></span>", accesskey: 'p'});
      this.controls.appendChild(this.controlsElements.playControl);
      this.bindEvent(this.controlsElements.playControl, 'playToggle');

      // Build rewind control.
      this.controlsElements.rewindControl = _V_.createElement("div", { className: "vc-rewind-control control-button", innerHTML: "<span></span>", accesskey: 'r'});
      this.controls.appendChild(this.controlsElements.rewindControl);
      this.bindEvent(this.controlsElements.rewindControl, 'rewind');

      // Build forward control.
      this.controlsElements.forwardControl = _V_.createElement("div", { className: "vc-forward-control control-button", innerHTML: "<span></span>", accesskey: 'f'});
      this.controls.appendChild(this.controlsElements.forwardControl);
      this.bindEvent(this.controlsElements.forwardControl, 'forward');

      // Build the progress control.
      this.controlsElements.progressControl = _V_.createElement("div", { className: "vc-progress-control" });

      // Create a holder for the progress bars.
      this.controlsElements.progressHolder = _V_.createElement("div", { className: "vc-progress-holder" });
      this.controlsElements.progressControl.appendChild(this.controlsElements.progressHolder);
      this.bindEvent(this.controlsElements.progressHolder, 'progressClick');

      // Create the loading progress display.
      this.controlsElements.loadProgressBar = _V_.createElement("div", { className: "vc-load-progress" });
      this.controlsElements.progressHolder.appendChild(this.controlsElements.loadProgressBar);

      // Create the playing progress display.
      this.controlsElements.playProgressBar = _V_.createElement("div", { className: "vc-play-progress"});
      this.controlsElements.progressHolder.appendChild(this.controlsElements.playProgressBar);

      // Create a spacer between the start and stop mark.
      this.controlsElements.markingSpacer = _V_.createElement("div", { className: "vc-marking-spacer" });
      this.controlsElements.progressControl.appendChild(this.controlsElements.markingSpacer);

      // Create the playing progress display.
      this.controlsElements.playHandle = _V_.createElement("div", { className: "vc-play-handle" });
      this.controlsElements.progressControl.appendChild(this.controlsElements.playHandle);
      this.bindEvent(this.controlsElements.playHandle, "progressScrubber");

      // Create the startMark display.
      this.controlsElements.startMark = _V_.createElement("span", { className: "vc-start-mark marker" });
      this.controlsElements.progressControl.appendChild(this.controlsElements.startMark);
      this.bindEvent(this.controlsElements.startMark, "dragMarker");

      // Create the endMark.
      this.controlsElements.endMark = _V_.createElement("span", { className: "vc-end-mark marker" });
      this.controlsElements.progressControl.appendChild(this.controlsElements.endMark);
      this.bindEvent(this.controlsElements.endMark, "dragMarker");

      // Append progress bar.
      this.controls.appendChild(this.controlsElements.progressControl);

      // Create the progress time display (00:00 / 00:00).
      this.controlsElements.timeControl = _V_.createElement("div", { className: "vc-time-control" });

      // Create the current play time display.
      this.controlsElements.currentTimeDisplay = _V_.createElement("span", { className: "vc-current-time-display", innerHTML: "00:00" });
      this.controlsElements.timeControl.appendChild(this.controlsElements.currentTimeDisplay);

      // Add time separator.
      this.controlsElements.timeSeparator = _V_.createElement("span", { innerHTML: " / " });
      this.controlsElements.timeControl.appendChild(this.controlsElements.timeSeparator);

      // Create the total duration display.
      this.controlsElements.durationDisplay = _V_.createElement("span", { className: "vc-duration-display", innerHTML: "00:00" });
      this.controlsElements.timeControl.appendChild(this.controlsElements.durationDisplay);

      // Append time control.
      this.controls.appendChild(this.controlsElements.timeControl);

      // Create the volumne control.
      this.controlsElements.volumeControl = _V_.createElement("div", {
        className: "vc-volume-control control-button",
        innerHTML: "<div class='volume-button'><div class='volume-holder'><span></span><div class='volume-container'><div class='volume-bar'><div class='volume-level'></div><div class='volume-handle'></div></div></div></div></div>"
      });

      this.controls.appendChild(this.controlsElements.volumeControl);

      this.bindEvent($(this.controlsElements.volumeControl).find('.volume-handle'), 'volumeScrubber');
      this.bindEvent($(this.controlsElements.volumeControl).find('.volume-button'), 'toggleMute');

    },
    
    setLoading: function() {
      $(this.element).addClass('vc-loading').removeClass('vc-loaded');
    },
    
    finishLoading: function() {
      this.hasMetaData = true;
      $(this.element).addClass('vc-loaded').removeClass('vc-loading');
    },

    // Configure listeners
    configureListeners: function() {
      var that = this;

      this.player.onMetaData(function() {
        that.duration = that.player.getDuration();
        that.setDuration();
        that.finishLoading();

        // Init volume control.
        that.setVolumeLevel(that.player.getVolume());

        if (that.initMarksAtStart) {
          if (that.endMark) {
            that.setEndMark(that.endMark);
          }

          // Set startMark anyway.
          that.setStartMark(that.startMark);
        }
        else {
          // By default, set start mark to zero.
          that.setStartMark(0);
          // By default, set end mark to end of movie.
          that.setEndMark(that.duration);
        }
      });

      this.player.onBufferUpdate(function(time) {
        that.updateLoadProgress(time);
      });

      this.player.onProgressUpdate(function(time) {
        that.updatePlayProgress(time);
      }, "medium");

      this.player.onProgressUpdate(function(time) {
        that.updateTime(time);
      }, "low");

      this.player.onPlay(function() {
        $(that.element).addClass('vc-playing').removeClass('vc-paused vc-stopped');
      });

      this.player.onPause(function() {
        $(that.element).addClass('vc-paused').removeClass('vc-playing vc-stopped');
      });
      
      this.player.onStop(function() {
        $(that.element).addClass('vc-stopped').removeClass('vc-playing vc-paused');
        that.player.player.playAt(0, true);
        that.player.pause();
      });
    },

    configureMarkerInput: function() {
      var that = this;

      // Get references of timemarkers input
      if (!this.controlsElements.startMarkInput && !this.controlsElements.endMarkInput) {
        this.controlsElements.startMarkInput = $('.txt-start-mark', this.element)[0];
        this.controlsElements.endMarkInput = $('.txt-end-mark', this.element)[0];
      }

      if (!this.controlsElements.startMarkLabel && !this.controlsElements.endMarkLabel && !this.controlsElements.playFromHere) {
        this.controlsElements.playFromHere = $('.play-from-here');
        this.controlsElements.startMarkLabel = $('.start_mark .btn-mark-start');
        this.controlsElements.endMarkLabel = $('.end_mark .btn-mark-end');
      }

      // Add onchange listeners
      this.addVCEventListener(this.controlsElements.startMarkInput, 'change', function() {
        var parsedTime = that.fromTime(this.value);

        if (parsedTime > 0) {
          var time = (parsedTime >= that.duration) ? that.duration : parsedTime;
          time = (time + 2 >= (that.endMark) && that.endMark != 0 && that.endMark != null) ? that.endMark - 2 : time;
        }
        else {time = parsedTime}

        that.setStartMark(time);
      });
      this.addVCEventListener(this.controlsElements.endMarkInput, 'change', function() {
        var time = (that.fromTime(this.value) >= that.duration) ? that.duration : that.fromTime(this.value);
        that.setEndMark(time);
      });

      $(this.controlsElements.startMarkLabel).click(function() {
        that.setStartMark(that.player.getTime());
      });
      $(this.controlsElements.endMarkLabel).click(function() {
        that.setEndMark(that.player.getTime());
      });
      $(this.controlsElements.playFromHere).click(function() {
        that.player.player.stoppedAtEndMark = false;
        that.player.player.playAt(that.startMark, true);
      });
    },

    // Bind an event to an element
    bindEvent: function(element, action) {
      // Reference to context
      var that = this;

      switch (action) {
        
        // Play/Pause event
        case 'playToggle':
          this.addVCEventListener(element, 'click', function() {
            if (!that.hasMetaData) return;
            that.player.player.stoppedAtEndMark = true;
            that.player.playToggle();
          });
          break;
        
        // rewind event
        case 'rewind':
          this.addVCEventListener(element, 'click', function() {
            if (!that.hasMetaData) return;
            that.player.rewindVideo();
          });
          break;
        
        // Forward event.
        case 'forward':
          this.addVCEventListener(element, 'click', function() {
            if (!that.hasMetaData) return;
            that.player.forwardVideo();
          });
          break;
        
        // Progress scrubber event.
        case 'progressScrubber':
          $(element).mousedown(function() {
            if (!that.hasMetaData) return;
            that.player.pause();          
            var barLeftOffset = $(this).parent().offset().left;
            var barWidth = $(this).parent().width();
            var offsetLeft, offsetTime;
            
            $('body').mousemove(function(event) {
              if (event.pageX > barLeftOffset - 40 && event.pageX < barLeftOffset + barWidth + 20) {
                offsetLeft = Math.min(Math.max(0, (event.pageX - barLeftOffset)), barWidth);
                offsetTime = (offsetLeft / barWidth) * that.duration;
                $(element).css("left", offsetLeft);
                that.updateTime(offsetTime);
              }
            });
            $('body').mouseup(function() {
              if (offsetTime) that.player.player.playAt(offsetTime, false);
              $(this).unbind('mousemove mouseup');
            });
          });
          break;
        
        // Start playing at the x index of the element.
        case 'progressClick':
          $(element).click(function(event) {
            if (!that.hasMetaData) return;
            that.player.player.playAt((that.duration / $(element).width()) * (event.clientX - $(element).offset().left), false);
          });
          break;

        // Volume scrubber event.
        case 'volumeScrubber':
         $(element).mousedown(function() {
           if (!that.hasMetaData) return;
            var barTopOffset = $(element).parent().offset().top;
            var barHeight = $(element).parent().height();
            $('body').mousemove(function(event) {
              if (event.pageY > barTopOffset) {
                if (event.pageY < (barTopOffset + barHeight)) {
                  var offsetCalc = ((barHeight - (event.pageY - barTopOffset)) / barHeight) * 100;

                  $(element).css("top", (100 - offsetCalc) +"%");
                  $(element).prev().css('height', offsetCalc +"%");

                  var levelDrop = offsetCalc;

                  that.player.setVolume(levelDrop);
                }
                else {
                  $(element).css("top", "100%");
                  $(element).prev().css('height', "0%");

                  that.player.setVolume(0);
                }
              }
              else {
                $(element).css("top", "0%");
                $(element).prev().css('height', "100%");

                that.player.setVolume(100);
              }
            });
            $('body').mouseup(function() {
              $(this).unbind('mousemove mouseup');
            });
          });
          break;
        
        // Toggle mute
        case 'toggleMute':
          $(element).click(function() {
            if ($(this).hasClass('muted')) {
              $(this).removeClass('muted');

              that.player.setVolume(that.volumeLevel);
            }
            else {
              $(this).addClass('muted');

              that.volumeLevel = that.player.getVolume();
              that.player.setVolume(0);
            }
          }).children().click(function(e) {
            return false;
          });
          break;
        
        // Drag begin- and end markers.
        case 'dragMarker':
          $(element).mousedown(function() {
            if (!that.hasMetaData) return;
            var barLeftOffset = $(this).parent().offset().left;
            var barWidth = $(this).parent().width();
            var offsetLeft, offsetTime;
            
            $('body').mousemove(function(event) {
              // Built in a margin of 20px right,the 40px left is for the 
              //   negative left margin on the element.
              if (event.pageX > barLeftOffset - 40 && event.pageX < barLeftOffset + barWidth + 20) {
                offsetLeft = Math.min(Math.max(0, (event.pageX - barLeftOffset)), barWidth);
                offsetTime = (offsetLeft / barWidth) * that.duration;

                if ($(element).hasClass('vc-start-mark')) {
                  that.setStartMark(offsetTime, true);
                }
                else if ($(element).hasClass('vc-end-mark')) {
                  that.setEndMark(offsetTime, true);
                }
              }
            });
            $('body').mouseup(function() {
              if ($(element).hasClass('vc-start-mark')) {
                that.setStartMark(offsetTime);
              }
              else if ($(element).hasClass('vc-end-mark')) {
                that.setEndMark(offsetTime);
              }

              $(this).unbind('mousemove mouseup');
            });
          });
          break;
      }
    },

    // Set a new start point
    setStartMark: function(time, dragging) {
      dragging = dragging || false;
      time = parseFloat(time);
      if (isNaN(time)) return;
      time = (time > (this.endMark - 2) && this.endMark > 0) ? (this.endMark - 2) : time;
      time = Math.min(Math.max(0, time), this.duration);
      this.startMark = time;
      
      var leftOffset = this.startMark * (this.controlsElements.progressHolder.offsetWidth / this.duration);
      leftOffset = Math.round(Math.min(Math.max(leftOffset, 0), this.controlsElements.progressHolder.offsetWidth));

      this.controlsElements.startMark.style.display = 'block';
      this.controlsElements.startMark.style.left = leftOffset  + "px";
      this.controlsElements.markingSpacer.style.left = leftOffset  + "px";

      // Notify player.
      this.player.setStartMark(this.startMark);

      if (!dragging) {
        // Set ui changes.
        if (this.endMark) {
          document.location.hash = 't='+ this.toNeatSeconds(time) + ',' + this.toNeatSeconds(this.endMark);
        }
        else if (this.startMark) {
          document.location.hash = 't='+ this.toNeatSeconds(time);
        }
        this.updateLinks();
      }
      
      this.controlsElements.startMarkInput.value = this.toTime(this.startMark);
    },

    // Set a new end point
    setEndMark: function(time, dragging) {
      dragging = dragging || false;
      time = parseFloat(time);
      if (isNaN(time)) return;
      time = (time < this.startMark + 2) ? this.startMark + 2 : time;
      time = Math.min(Math.max(0, time), this.duration);
      this.endMark = time;
              
      var leftOffset = (time * (this.controlsElements.progressHolder.offsetWidth / this.duration));
      leftOffset = Math.min(Math.round(Math.max(leftOffset, 0)), this.controlsElements.progressHolder.offsetWidth);

      this.controlsElements.endMark.style.display = 'block';
      this.controlsElements.endMark.style.left = leftOffset + "px";
      this.controlsElements.markingSpacer.style.right  = Math.max(0, (this.controlsElements.progressHolder.offsetWidth - leftOffset)) + "px";

      // Notify player.
      this.player.setEndMark(time);

      if (!dragging) {
        // Set ui changes
        document.location.hash = 't='+ this.toNeatSeconds(this.startMark) + ',' + this.toNeatSeconds(this.endMark);
        this.updateLinks();
      }
      this.controlsElements.endMarkInput.value = this.toTime(time);
    },

    updateLoadProgress: function(time) {
      $(this.controlsElements.loadProgressBar).css('width', ((time / this.duration) * 100) + "%");
    },

    updatePlayProgress: function(time) {
      playProgress = (time / this.duration) * 100;
      $(this.controlsElements.playProgressBar).css("width", playProgress +"%");
      $(this.controlsElements.playHandle).css("left", playProgress +"%");
    },

    updateTime: function(time) {
      this.controlsElements.currentTimeDisplay.innerHTML = this.toTime(time, true);
    },

    setDuration: function() {
      this.controlsElements.durationDisplay.innerHTML = this.toTime(this.duration, true);
    },
    
    replaceTokens: function(str, replacements) {
      var k;
      for (k in replacements) {
        str = str.replace('\{%' + k + '%\}', replacements[k]);
      }
      return str;
    },

    updateLinks: function() {
      var url = (this.configuration.vc_share_url || location.toString());
      var timec = [];

      if (this.startMark > 0 && !isNaN(this.startMark) && (this.endMark == 0 || this.endMark == null || isNaN(this.endMark))) {
        url = location.toString().split('#')[0] + "#t=" + this.toNeatSeconds(this.startMark);
        timec.push(this.toNeatSeconds(this.startMark));
      }
      else if (!isNaN(this.startMark) && !isNaN(this.endMark)) {
        timec.push(this.toNeatSeconds(this.startMark));
        timec.push(this.toNeatSeconds(this.endMark));
      }
      
      url = this.replaceTokens(url, {timecode: timec.join(',')});
      var embed = (this.configuration.vc_share_embed || '<iframe src="' + url + '" width="100%" height="100%" frameborder="0"></iframe>');
      embed = this.replaceTokens(embed, {playback_url: url, timecode: timec.join(',')})
      $('.txt-share-embed', this.element).val(embed);
      $('.txt-share-url', this.element).val(url);
    },

    setVolumeLevel: function(volumeLevel) {
      $(this.controlsElements.volumeControl).find('.volume-handle').css("top", (100 - volumeLevel) +"%");
      $(this.controlsElements.volumeControl).find('.volume-level').css('height', volumeLevel +"%");

      if (volumeLevel == 0) {
        this.player.setVolume(0);
      }
      else if(volumeLevel) {
        this.player.setVolume(volumeLevel);
      }
    },

    // HELPER FUNCTIONS
    hasClass: function(ele,cls) {
      return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
    },

    addClass: function(ele,cls) {
      if (!this.hasClass(ele,cls)) ele.className += " "+cls;
    },

    removeClass: function(ele,cls) {
      if (this.hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
      }
    },
    
    // Converts seconds to neat seconds rounded to two decimals.
    toNeatSeconds: function(input) {
      if (isNaN(input)) return false;
      return Math.round(input * 100) / 100;
    },

    // display seconds in hh:mm:ss format
    toTime: function(input, noMs) {
      input = parseFloat(input);
      if (isNaN(input)) input = 0;
      var min = Math.floor(input / 60);
      input -= (min * 60);
      var sec = Math.floor(input);
      var ms = Math.round((input - sec) * 100);

      return this.pad(min) + ":" + this.pad(sec)  + (noMs ? "" : ":" + this.pad(ms));
    },

    // Returns seconds from a string in mm:ss format
    fromTime: function(timeInFormat) {
      var result = 0;

      // Split string on delimiter
      var timeParts = timeInFormat.split(':');

      if (timeParts.length == 3) {
        if (parseInt(timeParts[0]) >= 0 && parseInt(timeParts[1]) >= 0 && parseInt(timeParts[2]) >= 0) {
          result = ((parseInt(timeParts[0]) * 60) + parseInt(timeParts[1]) + (parseInt(timeParts[2]) / 100));
        }
      }
      
      if (isNaN(result)) {
        return 0;
      }

      return result;
    },

    // Prefix integer with leading zero if nessessary.
    pad: function(val) {
      val = parseInt(val, 10);
      return val >= 10 ? val : "0" + val;
    },

    addVCEventListener: function(element, event, fn) {
      if (!element.addEventListener) {
        element.attachEvent("on"+ event, function() {
          fn.call(element);
        });
      }
      else {
        element.addEventListener(event, function() {
          fn.call(element);
        }, true);
      }
    }
  };
  
  // Create a config object
  var virtualCutterConf = {
    hideControls: true,
    playerConf: {
      defaultVolume: 1,
      flashVersion: 9,
      linksHiding: true,
      playOnClick: true
    },
    basePath: './assets',
    vc_share_url: '',
    vc_share_embed: '',
    vc_duration: false
  };

  // If Flash should be forced, extend configuration object
  if (window.location.href.indexOf("?forceFlash") !== -1) {
    virtualCutterConf.forceFlash = true;
  }
  
  if (typeof(Drupal) != 'undefined') {
    virtualCutterConf.basePath = Drupal.settings.vc_basepath;
    if (typeof(Drupal.settings.vc_ratio) != 'undefined') {
      virtualCutterConf.defaultAspectRatio = Drupal.settings.vc_ratio;
    }
    if (typeof(Drupal.settings.vc_duration) != 'undefined') {
      virtualCutterConf.vc_duration = Drupal.settings.vc_duration;
    }
    if (typeof(Drupal.settings.vc_share_url) != 'undefined') {
      virtualCutterConf.vc_share_url = Drupal.settings.vc_share_url;
      virtualCutterConf.vc_share_embed = Drupal.settings.vc_share_embed;
    }
    $(document).ready(function() {
      VirtualCutter.init($('#virtualcutter'), virtualCutterConf);
    });
  }
  else {
    // Initialize VirtualCutter
    VirtualCutter.init('#virtualcutter', virtualCutterConf);
  }
};
