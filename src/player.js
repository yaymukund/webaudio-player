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

  play(url) {
    if (this._url === url) {
      this.seekToPercent(0);
      this._audio.play();
      return;
    }

    this._unload();

    this.preload(url).then(audio => {
      this._audio = audio;
      this._source = this._context.createMediaElementSource(audio);
      this._source.connect(this._destination);

      audio.addEventListener('ended', () => {
        this._emitter.trigger('ended')
      });

      this._url = url;
      audio.play();
    });
  }

  preload(url) {
    let audio = this._cache.get(url);

    if (audio) {
      return Promise.resolve(audio);
    }

    audio = new Audio();
    audio.src = url;

    return new Promise(resolve => {
      audio.addEventListener('canplaythrough', () => resolve(audio));
      audio.load();
      this._cache.set(url, audio);
    });
  }

  stop() {
    this._audio.pause();
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
    if (this._audio) {
      this.stop();
      this._audio.removeEventListener('ended');
      this._audio.removeEventListener('canplaythrough');
      this._url = null;
      this._audio = null;
    }
  }

  getSeconds() {
    return (this._audio && this._audio.currentTime) || 0;
  }

  getDuration() {
    return (this._audio && this._audio.duration) || 0;
  }

  seekToPercent(percent) {
    this._audio.currentTime = percent * this.getDuration();
  }

  on() {
    this._emitter.on(...arguments);
  }
}
