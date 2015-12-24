var transpile = require('broccoli-babel-transpiler'),
    concat = require('broccoli-concat');

var tree = transpile('src', {
  modules: 'amdStrict',
  moduleRoot: 'webaudio-player',
  moduleIds: true
});

module.exports = concat(tree, {
  inputFiles: ['**/*.js'],
  outputFile: '/webaudio-player.js'
});
