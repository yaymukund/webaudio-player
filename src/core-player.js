import { libs } from './settings';
import { fetch } from './request';
import Cache from './cache';

export default class CorePlayer {
  constructor() {
    this.cache = new Cache();
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1;
    this.gainNode.connect(this.audioContext.destination);
    this.__onended_callbacks = [];

    this.track = {
      // duration
      // startedAt
    };
  }

  on(name, fn) {
    if (name === 'ended') {
      this.__onended_callbacks.push(fn);
    }
  }

  _decode(arrayBuffer) {
    let deferred = libs.RSVP.defer();

    this.audioContext.decodeAudioData(
      arrayBuffer,
      deferred.resolve,
      deferred.reject
    );

    return deferred.promise;
  }

  _play(buffer=null, when=0, offset=0) {
    this._stop(when);
    this.unpause();
    buffer = buffer || this.bufferSource.buffer;

    let bufferSource = this.audioContext.createBufferSource();
    bufferSource.buffer = buffer;
    this.bufferSource = bufferSource;

    this.track.duration = buffer.duration;
    this.track.startedAt = this.audioContext.currentTime - offset;

    bufferSource.connect(this.gainNode);
    bufferSource.start(when, offset);

    let self = this;

    this.bufferSource.onended = function() {
      if (self.bufferSource === bufferSource) {
        self.pause();
        self.__onended_callbacks.forEach(cb => { cb(); });
      }
    };
  }

  _stop(when=0) {
    if (this.bufferSource) {
      this.bufferSource.stop(when);
    }
  }

  getSeconds() {
    if (!this.track.startedAt) {
      return 0;
    }

    return Math.floor(this.audioContext.currentTime - this.track.startedAt);
  }

  getDuration() {
    if (!this.track.duration) {
      return 0;
    }

    return Math.floor(this.track.duration);
  }

  play(url, when=0, offset=0) {
    let audioBuffer = this.cache.get(url);

    if (audioBuffer) {
      this._play(audioBuffer, when, offset);
      return;
    }

    fetch(url)
      .then(this._decode.bind(this))
      .then(audioBuffer => {
        this._play(audioBuffer, when, offset);
      });
  }

  preload(url) {
    fetch(url)
      .then(this._decode.bind(this))
      .then(audioBuffer => {
        this.cache.set(url, audioBuffer);
      });
  }

  pause() {
    this._isPaused = true;
    return this.audioContext.suspend();
  }

  unpause() {
    this._isPaused = false;
    return this.audioContext.resume();
  }

  setVolume(volume) {
    this.gainNode.gain.value = volume;
  }

  getVolume() {
    return this.gainNode.gain.value;
  }

  seekToPercent(percent) {
    let seconds = percent * this.getDuration();
    this._play(null, 0, seconds);
  }

  isPaused() {
    return this._isPaused;
  }
}
