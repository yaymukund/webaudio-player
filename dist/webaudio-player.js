define('webaudio-player/cache', ['exports'], function (exports) {

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  // k = key, v = value, e = (cache) entry

  var Cache = (function () {
    function Cache() {
      var size = arguments[0] === undefined ? 5 : arguments[0];

      _classCallCheck(this, Cache);

      this.cache = [];
      this.size = size;
    }

    _createClass(Cache, [{
      key: "get",
      value: function get(k) {
        var v = undefined;

        this.cache.forEach(function (e) {
          if (e.k === k) {
            v = e.v;
          }
        });

        return v;
      }
    }, {
      key: "set",
      value: function set(k, v) {
        if (this.get(k)) {
          return;
        }

        this.cache.push({
          k: k,
          v: v
        });

        if (this.cache.length > this.size) {
          this.cache.shift();
        }
      }
    }]);

    return Cache;
  })();

  exports['default'] = Cache;

});
define('webaudio-player/core-player', ['exports', 'webaudio-player/settings', 'webaudio-player/request', 'webaudio-player/cache'], function (exports, settings, request, Cache) {

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var CorePlayer = (function () {
    function CorePlayer() {
      _classCallCheck(this, CorePlayer);

      this.cache = new Cache['default']();
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1;
      this.gainNode.connect(this.audioContext.destination);
      this.__onended_callbacks = [];

      this.track = {};
    }

    _createClass(CorePlayer, [{
      key: 'on',
      value: function on(name, fn) {
        if (name === 'ended') {
          this.__onended_callbacks.push(fn);
        }
      }
    }, {
      key: '_decode',
      value: function _decode(arrayBuffer) {
        var deferred = settings.libs.RSVP.defer();

        this.audioContext.decodeAudioData(arrayBuffer, deferred.resolve, deferred.reject);

        return deferred.promise;
      }
    }, {
      key: '_play',
      value: function _play() {
        var buffer = arguments[0] === undefined ? null : arguments[0];
        var when = arguments[1] === undefined ? 0 : arguments[1];
        var offset = arguments[2] === undefined ? 0 : arguments[2];

        this._stop(when);
        this.unpause();
        buffer = buffer || this.bufferSource.buffer;

        var bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = buffer;
        this.bufferSource = bufferSource;

        this.track.duration = buffer.duration;
        this.track.startedAt = this.audioContext.currentTime - offset;

        bufferSource.connect(this.gainNode);
        bufferSource.start(when, offset);

        var self = this;

        this.bufferSource.onended = function () {
          if (self.bufferSource === bufferSource) {
            self.pause();
            self.__onended_callbacks.forEach(function (cb) {
              cb();
            });
          }
        };
      }
    }, {
      key: '_stop',
      value: function _stop() {
        var when = arguments[0] === undefined ? 0 : arguments[0];

        if (this.bufferSource) {
          this.bufferSource.stop(when);
        }
      }
    }, {
      key: 'getSeconds',
      value: function getSeconds() {
        if (!this.track.startedAt) {
          return 0;
        }

        return Math.floor(this.audioContext.currentTime - this.track.startedAt);
      }
    }, {
      key: 'getDuration',
      value: function getDuration() {
        if (!this.track.duration) {
          return 0;
        }

        return Math.floor(this.track.duration);
      }
    }, {
      key: 'play',
      value: function play(url) {
        var _this = this;

        var when = arguments[1] === undefined ? 0 : arguments[1];
        var offset = arguments[2] === undefined ? 0 : arguments[2];

        var audioBuffer = this.cache.get(url);

        if (audioBuffer) {
          this._play(audioBuffer, when, offset);
          return;
        }

        request.fetch(url).then(this._decode.bind(this)).then(function (audioBuffer) {
          _this._play(audioBuffer, when, offset);
        });
      }
    }, {
      key: 'preload',
      value: function preload(url) {
        var _this2 = this;

        request.fetch(url).then(this._decode.bind(this)).then(function (audioBuffer) {
          _this2.cache.set(url, audioBuffer);
        });
      }
    }, {
      key: 'pause',
      value: function pause() {
        this._isPaused = true;
        return this.audioContext.suspend();
      }
    }, {
      key: 'unpause',
      value: function unpause() {
        this._isPaused = false;
        return this.audioContext.resume();
      }
    }, {
      key: 'setVolume',
      value: function setVolume(volume) {
        this.gainNode.gain.value = volume;
      }
    }, {
      key: 'getVolume',
      value: function getVolume() {
        return this.gainNode.gain.value;
      }
    }, {
      key: 'seekToPercent',
      value: function seekToPercent(percent) {
        var seconds = percent * this.getDuration();
        this._play(null, 0, seconds);
      }
    }, {
      key: 'isPaused',
      value: function isPaused() {
        return this._isPaused;
      }
    }]);

    return CorePlayer;
  })();

  exports['default'] = CorePlayer;

  // duration
  // startedAt

});
define('webaudio-player/player', ['exports', 'webaudio-player/core-player'], function (exports, CorePlayer) {

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Player = (function () {
    function Player() {
      _classCallCheck(this, Player);

      this._player = new CorePlayer['default']();
    }

    _createClass(Player, [{
      key: 'play',
      value: function play(url) {
        var when = arguments[1] === undefined ? 0 : arguments[1];
        var offset = arguments[2] === undefined ? 0 : arguments[2];

        this._player.play(url, when, offset);
      }
    }, {
      key: 'pause',
      value: function pause() {
        this._player.pause();
      }
    }, {
      key: 'unpause',
      value: function unpause() {
        this._player.unpause();
      }
    }, {
      key: 'setVolume',
      value: function setVolume(volume) {
        this._player.setVolume(volume);
      }
    }, {
      key: 'getVolume',
      value: function getVolume(volume) {
        return this._player.getVolume(volume);
      }
    }, {
      key: 'mute',
      value: function mute() {
        this.oldVolume = this._player.getVolume();
        this.setVolume(0);
      }
    }, {
      key: 'unmute',
      value: function unmute() {
        this.setVolume(this.oldVolume || 1);
        this.oldVolume = null;
      }
    }, {
      key: 'preload',
      value: function preload(url) {
        this._player.preload(url);
      }
    }, {
      key: 'getSeconds',
      value: function getSeconds() {
        return this._player.getSeconds();
      }
    }, {
      key: 'getDuration',
      value: function getDuration() {
        return this._player.getDuration();
      }
    }, {
      key: 'isPaused',
      value: function isPaused() {
        return this._player.isPaused();
      }
    }, {
      key: 'seekToPercent',
      value: function seekToPercent(percent) {
        return this._player.seekToPercent(percent);
      }
    }, {
      key: 'on',
      value: function on(name, fn) {
        return this._player.on(name, fn);
      }
    }]);

    return Player;
  })();

  exports['default'] = Player;

});
define('webaudio-player/request', ['exports', 'webaudio-player/settings'], function (exports, settings) {

  'use strict';

  var fetch = function fetch(url) {
    var request = new XMLHttpRequest(),
        deferred = settings.libs.RSVP.defer();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      deferred.resolve(request.response);
    };

    request.onerror = function () {
      var error = new Error('Could not fetch url ' + url);
      deferred.reject(error);
    };

    request.send();
    return deferred.promise;
  };

  exports.fetch = fetch;

});
define('webaudio-player/settings', ['exports'], function (exports) {

  'use strict';

  var libs = {};

  var configure = function configure(options) {
    libs.RSVP = options.RSVP;
  };

  exports.configure = configure;
  exports.libs = libs;

});//# sourceMappingURL=webaudio-player.map