module.exports = function(config) {

  var customLaunchers = {
    'SL_CHROME': {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '50'
    },
    'SL_FIREFOX': {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '45'
    },
    'SL_SAFARI7': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.9',
      version: '7'
    },
    'SL_IOS8': {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.10',
      version: '8.4'
    },
    'SL_IE10': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 2012',
      version: '10'
    },
    'SL_ANDROID4.1': {
      base: 'SauceLabs',
      browserName: 'android',
      platform: 'Linux',
      version: '4.1'
    }
  };


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
    reporters: ['progress', 'mocha', 'coverage', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: 'info',
    autoWatch: false,
    sauceLabs: {
      testName: 'IronSource Atom js',
      retryLimit: 1,
      recordVideo: false,
      recordScreenshots: false,
      build: process.env.TRAVIS_BUILD_NUMBER,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      startConnect: true
    },
    captureTimeout: 200000,
    browserDisconnectTimeout : 50000,
    browserDisconnectTolerance : 3,
    browserNoActivityTimeout : 20000,
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    singleRun: true
  })
};
