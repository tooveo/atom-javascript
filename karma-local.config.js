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
      debug: true
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: 'info',
    browsers: ['PhantomJS'],
    autoWatch: false,
    singleRun: true
  })
};
