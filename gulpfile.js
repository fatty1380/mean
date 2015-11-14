'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	defaultAssets = require('./config/assets/default'),
	testAssets = require('./config/assets/test'),
	gulp = require('path'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	runSequence = require('run-sequence'),
	plugins = gulpLoadPlugins();

var stylish = require('jshint-stylish'),
	ngHtml2Js = require('gulp-ng-html2js'),
	argv = require('yargs').argv,
	wrap = require('gulp-wrap'),
	concat = require('gulp-concat'),
	shell = require('gulp-shell');
	
var KarmaServer = require('karma').Server;

var mongoose = require('mongoose');

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
	process.env.NODE_ENV = 'test';
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
	process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
	process.env.NODE_ENV = 'production';
});

// Nodemon task
gulp.task('nodemon', function () {
	return plugins.nodemon({
		script: 'server.js',
		nodeArgs: ['--debug'],
		ext: 'js,html',
		watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
	});
});

// Watch Files For Changes
gulp.task('watch', function () {
	// Start livereload
	plugins.livereload.listen();

	// Add watch rules
	gulp.watch(defaultAssets.server.views).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.server.allJS, ['jshint']).on('change', plugins.livereload.changed);

	gulp.watch(defaultAssets.client.views, ['html2js']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.js, ['jshint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.css, ['csslint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.sass, ['sass', 'csslint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.less, ['less', 'csslint']).on('change', plugins.livereload.changed);
});

gulp.task('watch:tests', function () {
	// Start livereload
	plugins.livereload.listen();

	// Add watch rules
	gulp.watch(defaultAssets.server.views).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.server.allJS, ['jshint']).on('change', plugins.livereload.changed);

	gulp.watch(defaultAssets.client.views, ['html2js']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.js, ['jshint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.css, ['csslint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.sass, ['sass', 'csslint']).on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.less, ['less', 'csslint']).on('change', plugins.livereload.changed);

	var tests = _.union(testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e);

	if (/test\-server/.test(argv._[0])) {
		gulp.watch(tests, ['mocha']).on('change', plugins.livereload.changed);
	} else {
		gulp.watch(tests, ['mocha', 'karma']).on('change', plugins.livereload.changed);
	}
});

// CSS linting task
gulp.task('csslint', function (done) {
	return gulp.src(defaultAssets.client.css)
		.pipe(plugins.csslint('.csslintrc'))
		.pipe(plugins.csslint.reporter())
		.pipe(plugins.csslint.reporter(function (file) {
			if (!file.csslint.errorCount) {
				done();
			}
		}));
});

// JS linting task
gulp.task('jshint', function () {
    return gulp
        .src(_.union(defaultAssets.server.allJS, defaultAssets.client.js, testAssets.tests.server, testAssets.tests.client, testAssets.tests.e2e))
		.pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
	//.pipe(plugins.jshint.reporter('default'))
	//        .pipe(plugins.jshint.reporter('fail'))
        ;
});

gulp.task('html2js', function () {
	return gulp.src('modules/**/client/**/*.template.html')
		.pipe(ngHtml2Js({
			moduleName: 'theme',
			// declareModule: true,
			// stripPrefix: 'client/',
			rename: function (templateUrl, templateFile) {
				return '/' + templateUrl.replace('/client', '').replace('../', '');
			},
			template: '\t\t $templateCache.put(\'<%= template.url %>\',\n\t\t\t \'<%= template.escapedContent %>\');\n'
		}))
		.pipe(concat('templates.js'))
		.pipe(wrap('(function() { \n\t\'use strict\'; \n\n\tApplicationConfiguration.registerModule(\'theme\'); \n\n' +
			'\t angular.module(\'theme\').run([\'$templateCache\', function($templateCache) {\n\n' +
			'<%= contents %>' +
			'\t}]);' +
			'\n})();'))
		.pipe(gulp.dest('./modules/theme/client'));
});


// JS minifying task
gulp.task('uglify', function () {
	return gulp.src(defaultAssets.client.js)
		.pipe(plugins.ngAnnotate())
		.pipe(plugins.uglify({
			mangle: false
		}))
		.pipe(plugins.concat('application.min.js'))
		.pipe(gulp.dest('public/dist'));
});

// CSS minifying task
gulp.task('cssmin', function () {
	return gulp.src(defaultAssets.client.css)
		.pipe(plugins.cssmin())
		.pipe(plugins.concat('application.min.css'))
		.pipe(gulp.dest('public/dist'));
});

// Sass task
gulp.task('sass', function () {
	return gulp.src(defaultAssets.client.sass)
		.pipe(plugins.sass())
		.pipe(plugins.rename(function (path) {
			path.dirname = path.dirname.replace('/scss', '/css');
		}))
		.pipe(gulp.dest('./modules/'));
});

// Less task
gulp.task('less', function () {
	return gulp.src(defaultAssets.client.less)
		.pipe(plugins.less())
		.pipe(plugins.rename(function (path) {
			path.dirname = path.dirname.replace('/less', '/css');
		}))
		.pipe(gulp.dest('./modules/'));
});

// Connect to MongoDB using the mongoose module
gulp.task('mongoose', function (done) {
	var mongoose = require('./config/lib/mongoose.js');

    mongoose.connect(function (db) {
        done();
				});
});

gulp.task('run-tests', function () {
	var serverFiles = _.union(defaultAssets.server.views, defaultAssets.server.allJS, testAssets.tests.server);
	var clientFiles = _.union(defaultAssets.client.views, defaultAssets.client.js, defaultAssets.client.css, defaultAssets.client.sass, defaultAssets.client.less, testAssets.tests.client);

	if (!!argv.server) {
		gulp.watch(serverFiles, ['mocha']);
	} else if (!!argv.client) {
		gulp.watch(clientFiles, ['karma']);
	}
	else if (!!argv.watch) {
		// watch all, invoke all :)
		gulp.watch(clientFiles, ['karma']);
		gulp.watch(serverFiles, ['mocha']);
	}
});

// Mocha tests task
gulp.task('mocha', function (done) {
	var error;

    return gulp.src(testAssets.tests.server)
        .pipe(plugins.mocha({
			reporter: 'spec',
			grep: argv.grep
		}))
		.on('error', function (err) {
			// If an error occurs, save it
			error = err;
		})
		.on('end', function () {
			// When the tests are done, disconnect mongoose and pass the error state back to gulp
			mongoose.disconnect(function () {
				done(error);
			});
		});
});

// Karma test runner task
gulp.task('karma', function (done) {

	console.error('KARMA IS BROKEN');	
	// new KarmaServer({
	// 	configFile: 'karma.conf.js',
	// 	singleRun: true
	// }, done).start();
	
	
	// return gulp.src([])
	// 	.pipe(plugins.karma({
	// 		configFile: path.resolve('./karma.conf.js'),
	// 		action: 'run',
	// 		singleRun: true
	// 	}))
    //     .on('error', function (err) {
	// 		// Make sure failed tests cause gulp to exit non-zero
	// 		throw err;
	// 	});
});

gulp.task('apidoc', shell.task(['aglio -i modules/users/server/routes/users.server.routes.md -s -p 3001']));

// Selenium standalone WebDriver update task
gulp.task('webdriver-update', plugins.protractor.webdriver_update);

// Protractor test runner task
gulp.task('protractor', function () {
	gulp.src([])
		.pipe(plugins.protractor.protractor({
			configFile: 'protractor.conf.js'
		}))
		.on('error', function (e) {
			throw e;
		});
});

// Lint CSS and JavaScript files.
gulp.task('lint', function (done) {
	runSequence('less', 'sass', 'html2js', ['csslint', 'jshint'], done);
});

// Lint project files and minify them into two production files.
gulp.task('build', function (done) {
	runSequence('env:dev', 'lint', ['uglify', 'cssmin'], done);
});

// Run the project tests
gulp.task('test', function (done) {
	console.log('Running Tests, with config: %j', argv);
	var tests = ['karma', 'mocha'];
	if (!!argv.server && !argv.client) {
		tests = ['mocha'];
	} else if (!!argv.client && !argv.server) {
		tests = ['karma'];
	}
	
	console.log('Tests: ', tests);
	
	runSequence('env:test', 'mongoose', tests, done);
});

// Run the project tests
// gulp.task('test', function (done) {
// 	runSequence('env:test', 'mongoose', ['run-tests'], done);
// });

// Run the project tests
gulp.task('test-watch', function (done) {
	runSequence('env:test', 'mongoose', ['run-tests'], done);
});

// Run the project in development mode
gulp.task('default', function (done) {
	runSequence('env:dev', 'lint', ['nodemon', 'watch'], done);
});

// Run the project in debug mode
gulp.task('debug', function (done) {
	runSequence('env:dev', 'lint', ['nodemon', 'watch'], done);
});

// Run the project in production mode
gulp.task('prod', function (done) {
	runSequence('env:prod', 'build', ['nodemon', 'watch'], done);
});
