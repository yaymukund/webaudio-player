define('webaudio-player/audio-player', ['exports', 'webaudio-player/settings'], function (exports, settings) {

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var AudioPlayer = (function () {
    function AudioPlayer(context, destination) {
      _classCallCheck(this, AudioPlayer);

      this.context = context;
      this.destination = destination;
      this.audio = new Audio();
      this.__onended__callbacks = [];
    }

    _createClass(AudioPlayer, [{
      key: '_fetch',
      value: function _fetch(url) {
        var _this = this;

        var deferred = settings.libs.RSVP.defer();
        this.audio.src = url;
        this.url = url;
        this.audio.load();

        this.audio.addEventListener('ended', this.__onended.bind(this));
        this.audio.addEventListener('canplaythrough', function () {
          deferred.resolve(_this.audio);
        });

        return deferred.promise;
      }
    }, {
      key: 'play',
      value: function play(url) {
        var _this2 = this;

        if (this.url === url) {
          this.seekToPercent(0);
          this.audio.play();
          return;
        }

        this._fetch(url).then(function (audio) {
          if (!_this2.source) {
            _this2.source = _this2.context.createMediaElementSource(audio);
            _this2.source.connect(_this2.destination);
          }

          audio.play();
        });
      }
    }, {
      key: 'stop',
      value: function stop() {
        this.audio.pause();
      }
    }, {
      key: 'getSeconds',
      value: function getSeconds() {
        return this.audio.currentTime || 0;
      }
    }, {
      key: 'getDuration',
      value: function getDuration() {
        return this.audio.duration || 0;
      }
    }, {
      key: 'seekToPercent',
      value: function seekToPercent(percent) {
        this.audio.currentTime = percent * this.getDuration();
      }
    }, {
      key: 'on',
      value: function on(name, fn) {
        if (name === 'ended') {
          this.__onended__callbacks.push(fn);
        }
      }
    }, {
      key: '__onended',
      value: function __onended() {
        this.__onended__callbacks.forEach(function (cb) {
          cb();
        });
      }
    }]);

    return AudioPlayer;
  })();

  exports['default'] = AudioPlayer;

});
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
define('webaudio-player/player', ['exports', 'webaudio-player/audio-player', 'webaudio-player/xhr-player'], function (exports, AudioPlayer, XhrPlayer) {

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Player = (function () {
    function Player() {
      _classCallCheck(this, Player);

      this.context = new AudioContext();

      this.destination = this.context.createGain();
      this.destination.gain.value = 1;
      this.destination.connect(this.context.destination);
      this.__onended__callbacks = [];

      this.players = {
        audio: new AudioPlayer['default'](this.context, this.destination),
        xhr: new XhrPlayer['default'](this.context, this.destination)
      };

      this.players.audio.on('ended', this.__onended.bind(this));
      this.players.xhr.on('ended', this.__onended.bind(this));
      this.player = this.players.audio;
    }

    _createClass(Player, [{
      key: 'play',
      value: function play(url) {
        this.player.stop();

        if (this.players.xhr.isCached(url)) {
          this.player = this.players.xhr;
        } else {
          this.player = this.players.audio;
        }

        this.player.play(url);
      }
    }, {
      key: 'pause',
      value: function pause() {
        if (this.isPaused()) {
          return;
        }
        this._isPaused = true;
        this.context.suspend();
      }
    }, {
      key: 'unpause',
      value: function unpause() {
        if (!this.isPaused()) {
          return;
        }
        this._isPaused = false;
        this.context.resume();
      }
    }, {
      key: 'isPaused',
      value: function isPaused() {
        return this._isPaused;
      }
    }, {
      key: 'setVolume',
      value: function setVolume(volume) {
        this.destination.gain.value = volume;
      }
    }, {
      key: 'getVolume',
      value: function getVolume(volume) {
        return this.destination.gain.value;
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
        this.players.xhr.preload(url);
      }
    }, {
      key: 'getSeconds',
      value: function getSeconds() {
        return this.player.getSeconds();
      }
    }, {
      key: 'getDuration',
      value: function getDuration() {
        return this.player.getDuration();
      }
    }, {
      key: 'seekToPercent',
      value: function seekToPercent(percent) {
        return this.player.seekToPercent(percent);
      }
    }, {
      key: 'on',
      value: function on(name, fn) {
        if (name === 'ended') {
          this.__onended__callbacks.push(fn);
        }
      }
    }, {
      key: '__onended',
      value: function __onended() {
        this.__onended__callbacks.forEach(function (cb) {
          cb();
        });
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

});
define('webaudio-player/xhr-player', ['exports', 'webaudio-player/settings', 'webaudio-player/request', 'webaudio-player/cache'], function (exports, settings, request, Cache) {

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var XhrPlayer = (function () {
    function XhrPlayer(context, destination) {
      _classCallCheck(this, XhrPlayer);

      this.context = context;
      this.destination = destination;
      this._cache = new Cache['default']();
      this.__onended__callbacks = [];
    }

    _createClass(XhrPlayer, [{
      key: '_play',
      value: function _play() {
        var buffer = arguments[0] === undefined ? null : arguments[0];
        var offset = arguments[1] === undefined ? 0 : arguments[1];

        if (!buffer) {
          buffer = this.source.buffer;
        }

        if (this.source) {
          this.source.disconnect();
        }

        this.buffer = buffer;
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.destination);
        this.source.start(0, offset);
        this.startedAt = this.context.currentTime;
        this.source.onended = this.__onended.bind(this);
      }
    }, {
      key: 'stop',
      value: function stop() {
        if (this.source) {
          this.source.disconnect();
        }
      }
    }, {
      key: 'play',
      value: function play(url) {
        if (this.url === url) {
          this.seekToPercent(0);
          return;
        }

        var buffer = this._cache.get(url);

        if (!buffer) {
          throw new Error('Oops, you need to have preloaded the track.');
        }

        this.url = url;
        this._play(buffer);
      }
    }, {
      key: 'getSeconds',
      value: function getSeconds() {
        var duration = this.getDuration();

        if (!this.startedAt || !duration) {
          return 0;
        }

        var since = Math.floor(this.context.currentTime - this.startedAt);
        return Math.min(since, duration);
      }
    }, {
      key: 'getDuration',
      value: function getDuration() {
        if (!this.buffer) {
          return 0;
        }

        return Math.floor(this.buffer.duration);
      }
    }, {
      key: 'seekToPercent',
      value: function seekToPercent(percent) {
        var seconds = percent * this.getDuration();
        this._play(null, seconds);
      }
    }, {
      key: 'isPaused',
      value: function isPaused() {
        return this._isPaused;
      }
    }, {
      key: '_decode',
      value: function _decode(buffer) {
        var deferred = settings.libs.RSVP.defer();

        this.context.decodeAudioData(buffer, deferred.resolve, deferred.reject);

        return deferred.promise;
      }
    }, {
      key: 'preload',
      value: function preload(url) {
        var _this = this;

        request.fetch(url).then(this._decode.bind(this)).then(function (buffer) {
          _this._cache.set(url, buffer);
        });
      }
    }, {
      key: 'isCached',
      value: function isCached(url) {
        return !!this._cache.get(url);
      }
    }, {
      key: 'on',
      value: function on(name, fn) {
        if (name === 'ended') {
          this.__onended__callbacks.push(fn);
        }
      }
    }, {
      key: '__onended',
      value: function __onended() {
        this.__onended__callbacks.forEach(function (cb) {
          cb();
        });
      }
    }]);

    return XhrPlayer;
  })();

  exports['default'] = XhrPlayer;

});//# sourceMappingURL=webaudio-player.map