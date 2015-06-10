import { libs } from './settings';

let _fetch = function(url) {
  let request = new XMLHttpRequest(),
      deferred = libs.RSVP.defer();

  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = () => {
    deferred.resolve(request.response);
  };

  request.onerror = () => {
    let error = new Error(`Could not fetch url ${url}`);
    deferred.reject(error);
  };

  request.send();
  return deferred.promise;
};

let _decode = function(audioContext, arrayBuffer) {
  let deferred = libs.RSVP.defer();

  audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
    deferred.resolve(audioBuffer);
  }, deferred.reject);

  return deferred.promise;
};

export default class Player {
  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1;
    this.gainNode.connect(this.audioContext.destination);
  }

  play(url, when=0) {
    return _fetch(url).then(arrayBuffer => {
      return _decode(this.audioContext, arrayBuffer);
    }).then(audioBuffer => {
      let source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);
      source.start(when);
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
