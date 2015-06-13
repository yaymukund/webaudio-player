import { libs } from './settings';
// play
// getSeconds
// getDuration
// seekToPercent
// on('ended')
export default class AudioPlayer {
  constructor(context, destination) {
    this.context = context;
    this.destination = destination;
    this.audio = new Audio();
    this.__onended__callbacks = [];
  }

  _fetch(url) {
    let deferred = libs.RSVP.defer();
    this.audio.src = url;
    this.url = url;
    this.audio.load();

    this.audio.addEventListener('ended', this.__onended.bind(this));
    this.audio.addEventListener('canplaythrough', () => {
      deferred.resolve(this.audio);
    });

    return deferred.promise;
  }

  play(url) {
    if (this.url === url) {
      this.seekToPercent(0);
      this.audio.play();
      return;
    }

    this._fetch(url).then(audio => {
      if (!this.source) {
        this.source = this.context.createMediaElementSource(audio);
        this.source.connect(this.destination);
      }

      audio.play();
    });
  }

  stop() {
    this.audio.pause();
  }

  getSeconds() {
    return this.audio.currentTime || 0;
  }

  getDuration() {
    return this.audio.duration || 0;
  }

  seekToPercent(percent) {
    this.audio.currentTime = percent * this.getDuration();
  }

  on(name, fn) {
    if (name === 'ended') {
      this.__onended__callbacks.push(fn);
    }
  }

  __onended() {
    this.__onended__callbacks.forEach(cb => { cb(); });
  }
}
