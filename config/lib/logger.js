'use strict'
/**
 * Module dependencies.
 */
var bunyan = require('bunyan'),
chalk      = require('chalk'),
_          = require('lodash'),
vsprintf    = require('sprintf-js').vsprintf;

/**
 * Set chalk to be enabled, default is _false_ if not running in TTY
 */
 chalk.enabled = true;

/**
 * Default logger, shows anything level _trace_ and above
 */
var logger = bunyan.createLogger({
    name: 'outset',
    level: 'trace'
});


/**
 * API for custom log with colors, default colors included if not specified
 */

var colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray']


// test('hi %s %d', 'philip', 1, 'GREEN');
// test('outset %s', 'vault');
// test('test2');
// test('this test should be blue', 'blue');

function test(message) {
    var opts = _.last(arguments);
    var color = 'blue';
    var args = Array.prototype.slice.call(arguments);
    
    if(colors.indexOf(opts.toLowerCase()) != -1) {
        color = opts;
        console.log('color supplied: ' + color);
        args = args.slice(0, -1);
    }

    if(args.length > 1) {
        message = vsprintf(args[0], args.slice(1));
    }
    console.log(message);
}

function Log(level, inputArgs) {
    var opts = _.last(inputArgs);
    var args = Array.prototype.slice.call(inputArgs);
    var color = 'stripColor';

    if(colors.indexOf(String(opts).toLowerCase()) !== -1) {
        color = opts;
        args = args.slice(0, -1);
    }

    var message = '';
    if(args.length > 1) {
        message = vsprintf(args[0], args.slice(1));
    } else if(args.length === 1) {
        message = args[0];
    }

    logger[level](chalk[color](message));
}

var log = {
    trace: function(message, color) {
        Log('trace', arguments);
    },
    debug: function(message, color) {
        Log('debug', arguments);
    },
    info: function(message, color) {
        Log('info', arguments);
    },
    warn: function(message, color) {
        Log('warn', arguments);
    },  
    error: function(message, color) {
        Log('error', arguments);
    },
    fatal: function(message, color) {
        Log('fatal', arguments);
    },

    // TODO: Fix this temporary workaround - or decide that it's best
    child: function(opts) {
        return logger.child(opts);
    }
}

module.exports = log;
