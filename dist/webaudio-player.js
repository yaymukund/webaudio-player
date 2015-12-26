define("webaudio-player/cache", ["exports"], function (exports) {
  // k = key, v = value, e = (cache) entry
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Cache = (function () {
    function Cache() {
      var size = arguments.length <= 0 || arguments[0] === undefined ? 5 : arguments[0];

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

  exports["default"] = Cache;
});
define("webaudio-player/event-emitter", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var EventEmitter = (function () {
    function EventEmitter() {
      _classCallCheck(this, EventEmitter);

      this._handlers = {};
    }

    _createClass(EventEmitter, [{
      key: "on",
      value: function on(name, fn) {
        this._handlers[name] = this._handlers[name] || [];
        this._handlers[name].push(fn);
      }
    }, {
      key: "trigger",
      value: function trigger(name) {
        this._handlers[name] = this._handlers[name] || [];
        this._handlers[name].forEach(function (fn) {
          return fn();
        });
      }
    }]);

    return EventEmitter;
  })();

  exports["default"] = EventEmitter;
});
define('webaudio-player/player', ['exports', './cache', './event-emitter'], function (exports, _cache, _eventEmitter) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Player = (function () {
    function Player() {
      _classCallCheck(this, Player);

      this._context = new AudioContext();
      this._destination = this._context.createGain();
      this._destination.gain.value = 1;
      this._destination.connect(this._context.destination);
      this._cache = new _cache['default']();
      this._emitter = new _eventEmitter['default']();
    }

    _createClass(Player, [{
      key: 'play',
      value: function play(url) {
        var _this = this;

        if (this._url === url) {
          this.seekToPercent(0);
          this._source.mediaElement.play();
          return;
        }

        this._unload();

        this.preload(url).then(function (source) {
          _this._source = source;
          _this._source.connect(_this._destination);

          _this._source.mediaElement.addEventListener('ended', function () {
            _this._emitter.trigger('ended');
          });

          _this._url = url;
          _this.play(url);
        });
      }
    }, {
      key: 'preload',
      value: function preload(url) {
        var _this2 = this;

        var source = this._cache.get(url);

        if (source) {
          return Promise.resolve(source);
        }

        var audio = new Audio();
        audio.src = url;

        return new Promise(function (resolve) {
          var canplaythrough = function canplaythrough() {
            audio.removeEventListener('canplaythrough', canplaythrough);
            source = _this2._context.createMediaElementSource(audio);
            _this2._cache.set(url, source);
            resolve(source);
          };

          audio.addEventListener('canplaythrough', canplaythrough);
          audio.load();
        });
      }
    }, {
      key: 'stop',
      value: function stop() {
        this._source.mediaElement.pause();
      }
    }, {
      key: 'pause',
      value: function pause() {
        if (this.isPaused()) {
          return;
        }
        this._isPaused = true;
        this._context.suspend();
      }
    }, {
      key: 'unpause',
      value: function unpause() {
        if (!this.isPaused()) {
          return;
        }
        this._isPaused = false;
        this._context.resume();
      }
    }, {
      key: 'isPaused',
      value: function isPaused() {
        return this._isPaused;
      }
    }, {
      key: 'setVolume',
      value: function setVolume(volume) {
        this._destination.gain.value = volume;
      }
    }, {
      key: 'getVolume',
      value: function getVolume(volume) {
        return this._destination.gain.value;
      }
    }, {
      key: 'mute',
      value: function mute() {
        this._oldVolume = this.getVolume();
        this.setVolume(0);
      }
    }, {
      key: 'unmute',
      value: function unmute() {
        this.setVolume(this._oldVolume || 1);
        this.oldVolume = null;
      }
    }, {
      key: '_unload',
      value: function _unload() {
        if (this._source) {
          this.stop();
          this._url = null;
          this._source = null;
        }
      }
    }, {
      key: 'getSeconds',
      value: function getSeconds() {
        return this._source && this._source.mediaElement.currentTime || 0;
      }
    }, {
      key: 'getDuration',
      value: function getDuration() {
        return this._source && this._source.mediaElement.duration || 0;
      }
    }, {
      key: 'seekToPercent',
      value: function seekToPercent(percent) {
        this._source.mediaElement.currentTime = percent * this.getDuration();
      }
    }, {
      key: 'on',
      value: function on() {
        var _emitter;

        (_emitter = this._emitter).on.apply(_emitter, arguments);
      }
    }]);

    return Player;
  })();

  exports['default'] = Player;
});//# sourceMappingURL=webaudio-player.map