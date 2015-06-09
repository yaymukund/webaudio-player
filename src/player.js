import {
  decode,
  fetch,
  play
} from './webaudio';

export default class Player {
  constructor() {
    this.context = new AudioContext();
  }

  play(url, when=0) {
    fetch(url).then(arrayBuffer => {
      return decode(this.context, arrayBuffer);
    }).then(audioBuffer => {
      play(this.context, audioBuffer, when);
    });
  }
}
