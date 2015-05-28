'use strict'
/**
 * Module dependencies.
 */
var bunyan       = require('bunyan'),
    path         = require('path'),
    config       = require(path.resolve('./config/config')),
    chalk        = require('chalk'),
    _            = require('lodash'),
    PrettyStream = require('bunyan-prettystream'),
    vsprintf     = require('sprintf-js').vsprintf;

/**
 * Set chalk to be enabled, default is _false_ if not running in TTY
 */
chalk.enabled = true;

var reqSerializer = function (req) {
    return {
        method: req.method,
        url   : req.url,
        id    : req.id
    }
};



/**
 * Default logger, shows anything level _trace_ and above
 * TODO: Look into configuring special logging for 'TEST' runtime environment
 * https://groups.google.com/d/msg/bunyan-logging/N1snks1NrcY/S5kIUcf1EbEJ
 *
 * This has been moved to a property on the log object for now to facilitate streams
 */
//var logger = bunyan.createLogger({
//    name       : 'outset',
//    level      : 'trace',
//    serializers: {
//        req: reqSerializer //bunyan.stdSerializers.req
//    }
//});


/**
 * API for custom log with colors, default colors included if not specified
 */

var colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray']


// test('hi %s %d', 'philip', 1, 'GREEN');
// test('outset %s', 'vault');
// test('test2');
// test('this test should be blue', 'blue');

function test(message) {
    var opts  = _.last(arguments);
    var color = 'blue';
    var args  = Array.prototype.slice.call(arguments);
    
    if (colors.indexOf(opts.toLowerCase()) != -1) {
        color = opts;
        console.log('color supplied: ' + color);
        args  = args.slice(0, -1);
    }

    if (args.length > 1) {
        message = vsprintf(args[0], args.slice(1));
    }
    console.log(message);
}

function Log(level, inputArgs) {
    var opts  = _.last(inputArgs);
    var args  = Array.prototype.slice.call(inputArgs);
    var color = 'stripColor';

    if (colors.indexOf(String(opts).toLowerCase()) !== -1) {
        color = opts;
        args  = args.slice(0, -1);
    }

    var message = '';
    if (args.length > 1) {
        message = vsprintf(args[0], args.slice(1));
    } else if (args.length === 1) {
        message = args[0];
    }

    log.logger[level](chalk[color](message));
}

var log = {
    trace: function (message, color) {
        Log('trace', arguments);
    },
    debug: function (message, color) {
        Log('debug', arguments);
    },
    info : function (message, color) {
        Log('info', arguments);
    },
    warn : function (message, color) {
        Log('warn', arguments);
    },
    error: function (message, color) {
        Log('error', arguments);
    },
    fatal: function (message, color) {
        Log('fatal', arguments);
    },

    // TODO: Fix this temporary workaround - or decide that it's best
    child: function (opts) {
        return log.logger.child(opts);
    }
}

var _logger;

Object.defineProperty(log, 'logger', {
    enumerable: true,
    get: function() {
        if(_.isEmpty(_logger)) {
            var opts = {
                name       : 'outset',
                streams : [],
                serializers: {
                    req: reqSerializer //bunyan.stdSerializers.req
                }};

            if(config.utils.isDevMode()) {
                var prettyStdOut = new PrettyStream();
                prettyStdOut.pipe(process.stdout);

                opts.streams.push({
                    level: 'debug',
                    type: 'raw',
                    stream: prettyStdOut
                })
            }

            _logger = bunyan.createLogger(opts);
        }
        return _logger;
    }
})

module.exports = log;
