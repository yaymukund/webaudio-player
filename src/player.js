import Cache from './cache';
import EventEmitter from './event-emitter';

export default class Player {
  constructor() {
    this._context = new AudioContext();
    this._destination = this._context.createGain();
    this._destination.gain.value = 1;
    this._destination.connect(this._context.destination);
    this._cache = new Cache();
    this._emitter = new EventEmitter();
  }

  getCacheDebugInformation() {
    return this._cache.cache;
  }

  play(url) {
    if (this._url === url) {
      this.seekToPercent(0);
      this._source.mediaElement.play();
      return;
    }

    this._unload();
    this._url = url;

    this.preload(url).then(source => {
      if (this._url !== url) {
        return;
      }

      this._source = source;
      this._source.connect(this._destination);

      this._source.mediaElement.addEventListener('ended', () => {
        this._emitter.trigger('ended')
      });

      this.play(url);
    });
  }

  preload(url) {
    let source = this._cache.get(url);

    if (source) {
      return Promise.resolve(source);
    }

    let audio = new Audio();
    audio.src = url;

    return new Promise(resolve => {
      let canplaythrough = () => {
        audio.removeEventListener('canplaythrough', canplaythrough);
        source = this._context.createMediaElementSource(audio);
        this._cache.set(url, source);
        resolve(source);
      };

      audio.addEventListener('canplaythrough', canplaythrough);
      audio.load();
    });
  }

  stop() {
    this._source.mediaElement.pause();
  }

  pause() {
    if (this.isPaused()) { return; }
    this._isPaused = true;
    this._context.suspend();
  }

  unpause() {
    if (!this.isPaused()) { return; }
    this._isPaused = false;
    this._context.resume();
  }

  isPaused() {
    return this._isPaused;
  }

  setVolume(volume) {
    this._destination.gain.value = volume;
  }

  getVolume(volume) {
    return this._destination.gain.value;
  }

  mute() {
    this._oldVolume = this.getVolume();
    this.setVolume(0);
  }

  unmute() {
    this.setVolume(this._oldVolume || 1);
    this.oldVolume = null;
  }

  _unload() {
    if (this._source) {
      this.stop();
      this._url = null;
      this._source = null;
    }
  }

  getSeconds() {
    return (this._source && this._source.mediaElement.currentTime) || 0
  }

  getDuration() {
    return (this._source && this._source.mediaElement.duration) || 0;
  }

  seekToPercent(percent) {
    this._source.mediaElement.currentTime = percent * this.getDuration();
  }

  on() {
    this._emitter.on(...arguments);
  }
}
