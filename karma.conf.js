// Karma configuration
// Generated on Tue May 17 2016 14:33:19 GMT+0300 (EEST)
var fs = require('fs');

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha',  'browserify', 'sinon-chai'],
    client: {
      chai: {
        includeStack: true
      }
    },
    files: [
      'dist/sdk.js',
      'atom-sdk/test/*spec.js'
    ],
    exclude: [
    ],
    preprocessors: {
      'dist/sdk.js': ['browserify'],
      'atom-sdk/test/*.spec.js': ['browserify']
    },
    browserify: {
      debug: true,
      transform: [
       [
          'browserify-istanbul',
          {
            instrumenterConfig: {
              embedSource: true
            }
          }]
      ]
    },
    coverageReporter: {
      reporters: [
        {'type': 'text'},
        {'type': 'html', dir: 'coverage'},
        {'type': 'lcov'}
      ]
    },
    reporters: ['progress', 'mocha', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: 'info',
    autoWatch: false,
    sauceLabs: {
      testName: 'IronSource Atom js',
      startConnect: false
    },
    browsers: ['PhantomJS'],
    singleRun: true
  })
};
