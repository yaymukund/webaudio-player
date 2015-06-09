let libs = {};

let configure = function(options) {
  libs.RSVP = options.RSVP;
};

export {
  configure,
  libs
};
