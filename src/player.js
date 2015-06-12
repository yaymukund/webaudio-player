import CorePlayer from './core-player';

export default class Player {
  constructor() {
    this._player = new CorePlayer();
  }

  play(url, when=0, offset=0) {
    this._player.play(url, when, offset);
  }

  pause() {
    this._player.pause();
  }

  resume() {
    this._player.resume();
  }

  setVolume(volume) {
    this._player.setVolume(volume);
  }

  mute() {
    this.oldVolume = this._player.getVolume();
    this.setVolume(0);
  }

  unmute() {
    this.setVolume(this.oldVolume || 1);
    this.oldVolume = null;
  }

  preload(url) {
    this._player.preload(url);
  }

  getSeconds() {
    return this._player.getSeconds();
  }

  getDuration() {
    return this._player.getDuration();
  }

  seekToPercent(percent) {
    return this._player.seekToPercent(percent);
  }
}
