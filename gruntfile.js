'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    defaultAssets = require('./config/assets/default'),
    testAssets = require('./config/assets/test'),
    multidest = require('./grunt/multi_dest.js');

module.exports = function (grunt) {
    // Project Configuration
    grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            env: {
                test: {
                    NODE_ENV: 'test'
                },
                dev: {
                    NODE_ENV: 'development'
                },
                prod: {
                    NODE_ENV: 'production'
                }
            },
            watch: {
                serverViews: {
                    files: defaultAssets.server.views,
                    options: {
                        livereload: true
                    }
                },
                serverJS: {
                    files: defaultAssets.server.allJS,
                    tasks: ['jshint'],
                    options: {
                        livereload: true
                    }
                },
                clientViews: {
                    files: defaultAssets.client.views,
                    tasks: ['html2js'],
                    options: {
                        livereload: false // Allow the JS task to run it
                    }
                },
                clientJS: {
                    files: defaultAssets.client.js,
                    tasks: ['jshint'],
                    options: {
                        livereload: true
                    }
                },
                clientCSS: {
                    files: defaultAssets.client.css,
                    tasks: ['csslint'],
                    options: {
                        livereload: true
                    }
                },
                clientSCSS: {
                    files: defaultAssets.client.sass,
                    tasks: ['sass', 'csslint'],
                    options: {
                        livereload: true
                    }
                },
                clientLESS: {
                    files: defaultAssets.client.less,
                    tasks: ['less', 'csslint'],
                    options: {
                        livereload: true
                    }
                }
            },
            express: {
                options: {},
                test: {
                    options: {
                        script: 'server.js'
                    }
                }
            },
            nodemon: {
                dev: {
                    script: 'server.js',
                    options: {
                        nodeArgs: ['--debug'],
                        ext: 'js,html',
                        watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
                    }
                },
                default: {
                    script: 'server.js',
                    options: {
                        ext: 'js,html',
                        watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
                    }
                }
            },
            concurrent: {
                default: ['nodemon:default', 'watch'],
                debug: ['nodemon:dev', 'watch', 'node-inspector'],
                nowatch: ['nodemon:default'],
                options: {
                    logConcurrentOutput: true
                }
            },
            shell: {
                mongodb: {
                    command: './mongo-check-and-start.sh',
                    options: {
                        async: true,
                        stdout: false,
                        stderr: true,
                        failOnError: true,
                        execOptions: {
                            cwd: '.'
                        }
                    }
                }
            },
            copy: {
                clientJSHintRC: {
                    files: [{
                        src: 'client.jshintrc',
                        dest: 'modules/tmp/client/.jshintrc'
                    }]
                },
                serverJSHintRC: {
                    files: [{
                        src: './server.jshintrc',
                        dest: 'modules/tmp/server/'
                    }]
                },
                testJSHintRC: {
                    files: [{
                        src: './tests.jshintrc',
                        dest: 'modules/tmp/test/'
                    }]
                }
            },
            multidest: {
                copyClientJSHintRC: {
                    tasks: [
                        'copy:clientJSHintRC'
                    ],
                    dest: grunt.file.expand('./modules/*/client/')
                },
                copyServerJSHintRC: {
                    tasks: [
                        'copy:serverJSHintRC'
                    ],
                    dest: grunt.file.expand('./modules/*/server/')
                },
                copyTestJSHintRC: {
                    tasks: [
                        'copy:testJSHintRC'
                    ],
                    dest: grunt.file.expand('./modules/*/tests/')
                }
            },
            jshint: {
                all: {
                    src: _.union(defaultAssets.server.allJS, defaultAssets.client.js, testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e),
                    options: {
                        jshintrc: true,
                        node: true,
                        mocha: true,
                        jasmine: true
                    }
                }
            },
            html2js: {
                options: {
                    quoteChar: '\'',
                    singleModule: true,
                    useStrict: true,
                    module: 'oset-templates',
                    indentString: ' ',
                    rename: function (moduleName) {
                        return '/' + moduleName.replace('/client', '').replace('../', '');
                    }
                },
                main: {
                    src: ['modules/**/*.template.html'],
                    dest: 'modules/tmp/client/templates.js'
                }
            },
            csslint: {
                options: {
                    csslintrc: '.csslintrc'
                },
                all: {
                    src: defaultAssets.client.css
                }
            },
            ngAnnotate: {
                production: {
                    files: {
                        'public/dist/application.js': defaultAssets.client.js
                    }
                }
            },
            uglify: {
                production: {
                    options: {
                        mangle: false
                    },
                    files: {
                        'public/dist/application.min.js': 'public/dist/application.js'
                    }
                }
            },
            cssmin: {
                combine: {
                    files: {
                        'public/dist/application.min.css': defaultAssets.client.css
                    }
                }
            },
            sass: {
                dist: {
                    files: [{
                        expand: true,
                        src: defaultAssets.client.sass,
                        ext: '.css',
                        rename: function (base, src) {
                            return src.replace('/scss/', '/css/');
                        }
                    }]
                }
            },
            less: {
                dist: {
                    files: [{
                        expand: true,
                        src: defaultAssets.client.less,
                        ext: '.css',
                        rename: function (base, src) {
                            return src.replace('/less/', '/css/');
                        }
                    }]
                }
            },
            'node-inspector': {
                custom: {
                    options: {
                        'web-port': 1337,
                        'web-host': 'localhost',
                        'debug-port': 5858,
                        'save-live-edit': true,
                        'no-preload': true,
                        'stack-trace-limit': 50,
                        'hidden': []
                    }
                }
            },
            mochaTest: {
                default: {
                    src: testAssets.tests.server,
                    options: {
                        reporter: 'spec'
                    }
                },
                routes: {
                    src: testAssets.tests.routes
                },
                model: {
                    src: testAssets.tests.model
                },
                watch: {
                    options: {
                        reporter: 'min'
                    }
                }
            },
            karma: {
                unit: {
                    configFile: 'karma.conf.js'
                }
            },
            protractor: {
                options: {
                    configFile: 'protractor.conf.js',
                    keepAlive: true,
                    noColor: false
                },
                e2e: {
                    options: {
                        args: {} // Target-specific arguments
                    }
                }
            },
            bunyan: {
                strict: false,
                level: 'trace',
                output: 'short',
            }
        }
    );

// Load NPM tasks
    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-shell-spawn');

    grunt.loadNpmTasks('grunt-notify');

    grunt.loadNpmTasks('grunt-bunyan');

// Load external tasks:
    grunt.task.loadTasks('./grunt/');

// Making grunt default to force in order not to break the project.
    grunt.option('force', true);

// Register html2js to place html into the templateCache
    grunt.loadNpmTasks('grunt-html2js');

// Connect to the MongoDB instance and load the models
    grunt.task.registerTask('mongoose', 'Task that connects to the MongoDB instance and loads the application models.', function () {

        console.log('==== Connecting to MongoDB for Test Execution ====================================');

        // Get the callback
        var done = this.async();

        // Use mongoose configuration
        var mongoose = require('./config/lib/mongoose.js');

        // Connect to database
        mongoose.connect(function (db) {
            done();
        });
    });

    grunt.registerTask('jshintrc', ['multidest:copyClientJSHintRC', 'multidest:copyServerJSHintRC', 'multidest:copyTestJSHintRC']);


    grunt.registerTask('jshinter', ['jshintrc', 'jshint:all']);

// Lint CSS and JavaScript files.
    grunt.registerTask('lint', ['sass', 'less', 'jshinter', 'csslint', 'html2js']);

// Lint project files and minify them into two production files.
    grunt.registerTask('build', ['env:dev', 'lint', 'ngAnnotate', 'uglify', 'cssmin']);

// Run the project tests
    grunt.registerTask('test', ['env:test', 'mongoose', 'mochaTest', 'karma:unit']);
    grunt.registerTask('test:server', ['env:test', 'mongoose', 'mochaTest']);
    grunt.registerTask('test:routes', ['env:test', 'mongoose', 'mochaTest:routes']);
    grunt.registerTask('test:model', ['env:test', 'mongoose', 'mochaTest:model']);
    grunt.registerTask('test-e2e', ['env:test', 'express:test', 'protractor', 'express:test:stop']);

// Run the project in development mode
    grunt.registerTask('default', ['env:dev', 'bunyan', 'lint', 'concurrent:default']);

    grunt.registerTask('nowatch', ['env:dev', 'lint', 'concurrent:nowatch']);

// Run the project in debug mode
    grunt.registerTask('debug', ['env:dev', 'lint', 'concurrent:debug']);

// Run the project in production mode
    grunt.registerTask('prod', ['build', 'env:prod', 'concurrent:default']);

// Run the project in production mode
    grunt.registerTask('runprod', ['env:prod', 'concurrent:default']);
}
;
