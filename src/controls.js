import Player from './player';

export default class Controls {
  constructor() {
    this.player = new Player();
  }

  play(url, when=0) {
    this.player.play(url, when);
  }

  pause() {
    this.player.pause();
  }

  resume() {
    this.player.resume();
  }

  setVolume(volume) {
    this.player.setVolume(volume);
  }

  mute() {
    this.oldVolume = this.player.getVolume();
    this.setVolume(0);
  }

  unmute() {
    this.setVolume(this.oldVolume || 1);
    this.oldVolume = null;
  }

  preload(url) {
    this.player.preload(url);
  }

  getSeconds() {
    return this.player.getSeconds();
  }

  getDuration() {
    return this.player.getDuration();
  }
}
