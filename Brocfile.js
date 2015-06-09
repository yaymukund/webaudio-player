var funnel = require('broccoli-funnel'),
    transpile = require('broccoli-babel-transpiler'),
    ES6Modules = require('broccoli-es6modules'),
    concat = require('broccoli-sourcemap-concat');

var tree = funnel('./src', { destDir: 'webaudio-player' });

tree = transpile(tree, {
  nonStandard: false,
  blacklist: ['useStrict', 'es6.modules'],
  highlightCode: false
});

tree = new ES6Modules(tree, {
  format: 'namedAmd',
  esperantoOptions: {
    strict: true,
    absolutePaths: true
  }
});

module.exports = concat(tree, {
  inputFiles: ['**/*.js'],
  outputFile: '/webaudio-player.js'
});
