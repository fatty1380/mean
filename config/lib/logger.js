'use strict'
/**
 * Module dependencies.
 */
var bunyan = require('bunyan'),
chalk      = require('chalk');

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

var log = {
    trace: function(message, color) {
        color = color || 'gray';
        logger.info(chalk[color](message));
    },
    debug: function(message, color) {
        color = color || 'reset';
        logger.debug(chalk[color](message));
    },
    info: function(message, color) {
        color = color || 'blue';
        logger.info(chalk[color](message)); 
    },
    warn: function(message, color) {
        color = color || 'magenta';
        logger.debug(chalk[color](message));
    },  
    error: function(message, color) {
        color = color || 'red';
        logger.error(chalk[color](message));
    },
    fatal: function(message, color) {
        color = color || 'white';
        logger.debug(chalk[color]['bgBlack'](message));
    }
}
module.exports = log;