// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'https://cdn.firebase.com/v0/firebase.js',
      'app/bower_components/Blob.js/Blob.js',
      'app/bower_components/FileSaver/FileSaver.js',
      'app/bower_components/codemirror/lib/codemirror.js',
      'app/bower_components/codemirror/mode/xml/xml.js',
      'app/bower_components/codemirror/mode/css/css.js',
      'app/bower_components/codemirror/mode/javascript/javascript.js',
      'app/bower_components/jquery/jquery.js',
      'app/bower_components/js-beautify/js/lib/beautify-html.js',
      'app/bower_components/jszip/jszip.js',
      'app/bower_components/node-uuid/uuid.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/ng-grid/build/ng-grid.js',
      'app/bower_components/angular-*/*.js',
      'app/scripts/**/*.js',
      'app/scripts/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [
      'app/bower_components/angular-*/*.min.js',
      'app/scripts/preview.js'
    ],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
