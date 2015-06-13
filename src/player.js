import AudioPlayer from './audio-player';
import XhrPlayer from './xhr-player';
import * as events from './events';

export default class Player {
  constructor() {
    this.context = new AudioContext();

    this.destination = this.context.createGain();
    this.destination.gain.value = 1;
    this.destination.connect(this.context.destination);

    this.players = {
      audio: new AudioPlayer(this.context, this.destination),
      xhr: new XhrPlayer(this.context, this.destination)
    };

    this.player = this.players.audio;
  }

  play(url) {
    this.player.stop();

    if (this.players.xhr.isCached(url)) {
      this.player = this.players.xhr;
    } else {
      this.player = this.players.audio;
    }

    this.player.play(url);
  }

  pause() {
    if (this.isPaused()) { return; }
    this._isPaused = true;
    this.context.suspend();
  }

  unpause() {
    if (!this.isPaused()) { return; }
    this._isPaused = false;
    this.context.resume();
  }

  isPaused() {
    return this._isPaused;
  }

  setVolume(volume) {
    this.destination.gain.value = volume;
  }

  getVolume(volume) {
    return this.destination.gain.value;
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
    this.players.xhr.preload(url);
  }

  getSeconds() {
    return this.player.getSeconds();
  }

  getDuration() {
    return this.player.getDuration();
  }

  seekToPercent(percent) {
    return this.player.seekToPercent(percent);
  }

  on(name, fn) {
    events.on(name, fn);
  }
}
