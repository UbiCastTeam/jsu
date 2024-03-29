// Karma configuration
// Generated on Tue Sep 27 2022 10:45:26 GMT+0200 (Central European Summer Time)
/* globals module */
module.exports = (config) => {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
        frameworks: ['mocha', 'browserify'],


        // list of files / patterns to load in the browser
        files: [
            'src/jsu.js',
            'src/lib/*.js',
            'tests/*.spec.js',
            // fixtures
            {pattern: 'tests/mocking/*.json', watched: true, served: true, included: false}
        ],


        // list of files / patterns to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
        preprocessors: {
            'src/**/*.js': ['browserify', 'coverage'],
            'tests/*.spec.js': ['browserify']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
        reporters: ['mocha', 'coverage'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
        browsers: ['ChromeHeadlessNoSandbox'],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        },


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser instances should be started simultaneously
        concurrency: 1,

        browserify: {
            debug: true,
            plugin: ['esmify']
        },
        coverageReporter: {
            reporters:[
                {type: 'lcov', dir:'coverage/', includeAllSources: true},
                {type: 'text', includeAllSources: true}
            ]
        }
    });
};
