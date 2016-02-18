/* eslint-env node */
/* eslint no-console: 0 */
/* global process */
/* global __dirname */

var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
// var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var karma = require('karma').server;
var plugin = require('gulp-cordova-plugin');
var eslint = require('gulp-eslint');
var packageJSON = require('./package.json');
var protractor = require('gulp-protractor').protractor;
var webdriver_update = require('gulp-protractor').webdriver_update;


var paths = {
    sass: ['scss/styles.scss', 'scss/**/*.scss'],
    css: 'www/assets/css'
};

gulp.task('default', ['sass']);

gulp.task('sass', function (done) {
    gulp.src('./scss/styles.scss')
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest(paths.css))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(paths.css))
        .on('end', done);
});

gulp.task('lint', function () {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['www/modules/**/*.js', '!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
            );
        process.exit(1);
    }
    done();
});


gulp.task('webdriver_update', webdriver_update);

gulp.task('test', ['webdriver_update'], function(done) {
    gulp.src([]).pipe(protractor({
        configFile: 'protractor.conf.js',
    })).on('error', function(e) {
        console.log(e)
    }).on('end', done);        
});


gulp.task('plugins', function () {
    var plugins = packageJSON.cordovaPlugins;
    return gulp.src('./plugins')
        .pipe(plugin(plugins));
});
