import { libs } from './settings';

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

export { fetch };
