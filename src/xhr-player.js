import { libs } from './settings';
import { fetch } from './request';
import Cache from './cache';
import { trigger } from './events';

// play
// getSeconds
// getDuration
// pause
// unpause
// setVolume
// getVolume
// seekToPercent
// isPaused

export default class XhrPlayer {
  constructor(context, destination) {
    this.context = context;
    this.destination = destination;
    this._cache = new Cache();
    this.startedAt = 0;
  }

  _play(buffer=null, offset=0) {
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
    this.startedAt = this.context.currentTime - offset;
    this.source.onended = () => {
      trigger('ended');
    };
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
    }
  }

  play(url) {
    if (this.url === url) {
      this.seekToPercent(0);
      return;
    }

    let buffer = this._cache.get(url);

    if (!buffer) {
      throw new Error('Oops, you need to have preloaded the track.');
    }

    this.url = url;
    this._play(buffer);
  }

  getSeconds() {
    let duration = this.getDuration();
    let since = Math.floor(this.context.currentTime - this.startedAt);
    return Math.min(since, duration);
  }

  getDuration() {
    if (!this.buffer) {
      return 0;
    }

    return Math.floor(this.buffer.duration);
  }

  seekToPercent(percent) {
    let seconds = percent * this.getDuration();
    this._play(null, seconds);
  }

  isPaused() {
    return this._isPaused;
  }

  _decode(buffer) {
    let deferred = libs.RSVP.defer();

    this.context.decodeAudioData(
      buffer,
      deferred.resolve,
      deferred.reject
    );

    return deferred.promise;
  }

  preload(url) {
    fetch(url)
      .then(this._decode.bind(this))
      .then(buffer => {
        this._cache.set(url, buffer);
      });
  }

  isCached(url) {
    return !!this._cache.get(url);
  }
}
