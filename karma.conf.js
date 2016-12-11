module.exports = function (config) {

  var customLaunchers = {
    // Chrome
    'SL_CHROME26': {base: 'SauceLabs', browserName: 'chrome', version: '26'},
    'SL_CHROME50': {base: 'SauceLabs', browserName: 'chrome', version: '54'},
    // Firefox
    'SL_FIREFOX4': {base: 'SauceLabs', browserName: 'firefox', version: '4'},
    'SL_FIREFOX46': {base: 'SauceLabs', browserName: 'firefox', version: '46'},
    // Safari
    'SL_SAFARI6': {base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.8', version: '6'},
    'SL_SAFARI10': {base: 'SauceLabs', browserName: 'safari', platform: 'OS X 10.11', version: '10.0'},
    // Explorer
    'SL_IE9': {base: 'SauceLabs', browserName: 'internet explorer', platform: 'Windows 7', version: '9'},
    'SL_IE11': {base: 'SauceLabs', browserName: 'internet explorer', platform: 'Windows 7', version: '11'},
    // Edge
    'SL_EDGE': {base: 'SauceLabs', browserName: 'MicrosoftEdge', platform: 'Windows 10', version: '13.10586'},
    // Android
    'SL_ANDROID4.0': {base: 'SauceLabs', browserName: 'android', platform: 'Linux', version: '4.0'},
    'SL_ANDROID5.1': {base: 'SauceLabs', browserName: 'android', platform: 'Linux', version: '5.1'},
    // IOS
    'SL_IOS7': {base: 'SauceLabs', browserName: 'iphone', platform: 'OS X 10.9', version: '8.1'},
    'SL_IOS10': {base: 'SauceLabs', browserName: 'iphone', platform: 'iOS', version: '10.0'},
    // Opera
    'SL_OPERA': {base: 'SauceLabs', browserName: 'opera', platform: 'Windows 7', version: '12.12'}
  };


  config.set({
    basePath: '',
    frameworks: ['mocha', 'browserify', 'sinon-chai'],
    client: {
      chai: {
        includeStack: true
      }
    },
    files: [
      'dist/sdk.js',
      'atom-sdk/test/*spec.js'
    ],
    exclude: [],
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
      retryLimit: 3,
      recordVideo: false,
      recordScreenshots: false,
      build: process.env.TRAVIS_BUILD_NUMBER,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      startConnect: true,
      public: 'public'
    },
    captureTimeout: 260000,
    browserDisconnectTimeout: 60000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    singleRun: true
  })
};
