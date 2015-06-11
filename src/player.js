import { libs } from './settings';
import { fetch } from './request';
import Cache from './cache';

export default class Player {
  constructor() {
    this.cache = new Cache();
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1;
    this.gainNode.connect(this.audioContext.destination);

    this.track = {
      // duration
      // startedAt
    };
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

  _play(audioBuffer, when=0, offset=0) {
    this._stop(when);

    this.track.duration = audioBuffer.duration;
    this.track.startedAt = this.audioContext.currentTime - offset;

    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = audioBuffer;
    this.bufferSource.connect(this.gainNode);
    this.bufferSource.start(when, offset);
    this.bufferSource.onended = () => {
      this.onended();
    };
  }

  _stop(when=0) {
    if (this.bufferSource) {
      this.bufferSource.stop(when);
    }
  }

  getSeconds() {
    return Math.floor(this.audioContext.currentTime - this.track.startedAt);
  }

  getDuration() {
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
    return this.audioContext.suspend();
  }

  resume() {
    return this.audioContext.resume();
  }

  setVolume(volume) {
    this.gainNode.gain.value = volume;
  }

  getVolume() {
    return this.gainNode.gain.value;
  }
}
