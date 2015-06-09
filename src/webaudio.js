import { libs } from './settings';

let decode = function(context, arrayBuffer) {
  let deferred = libs.RSVP.defer();

  context.decodeAudioData(arrayBuffer, (audioBuffer) => {
    deferred.resolve(audioBuffer);
  }, deferred.reject);

  return deferred.promise;
};

let fetch = function(url) {
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

let play = function(context, buffer, when=0) {
  let source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(when);
};

export {
  decode,
  fetch,
  play
}
