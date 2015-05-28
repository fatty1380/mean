'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    chalk = require('chalk'),
    glob = require('glob'),
    path = require('path');

/**
 * Get files by glob patterns
 */
var getGlobbedPaths = function(globPatterns, excludes) {
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function(globPattern) {
            output = _.union(output, getGlobbedPaths(globPattern, excludes));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob.sync(globPatterns);
            if (excludes) {
                files = files.map(function(file) {
                    if (_.isArray(excludes)) {
                        for (var i in excludes) {
                                if (excludes.hasOwnProperty(i)) {
                            file = file.replace(excludes[i], '');
                        }
                            }
                    } else {
                        file = file.replace(excludes, '');
                    }
                    return file;
                });
            }
            output = _.union(output, files);
        }
    }

    return output;
};

/**
 * Returns a boolean whether the runtime is "dev" - aka, not production
 */
var isDevMode = function() {
    return process.env.NODE_ENV !== 'production';
};

/**
 * Validate NODE_ENV existance
 */
var validateEnvironmentVariable = function() {
    var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');

    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
        } else {
            console.error(chalk.red('NODE_ENV is not defined! Using default development environment'));
        }
        process.env.NODE_ENV = 'development';
    } else {
        console.log(chalk.bold('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
    }
};

/**
 * Initialize global configuration files
 */
var initGlobalConfigFolders = function(config, assets) {
    // Appending files
    config.folders = {
        server: {},
        client: {}
    };

    // Setting globbed client paths
    config.folders.client = getGlobbedPaths(path.join(process.cwd(), 'modules/*/client/'), process.cwd().replace(new RegExp(/\\/g),'/'));
};

/**
 * Initialize global configuration files
 */
var initGlobalConfigFiles = function(config, assets) {
    // Appending files
    config.files = {
        server: {},
        client: {}
    };

    // Setting Globbed model files
    config.files.server.models = getGlobbedPaths(assets.server.models);

    // Setting Globbed route files
    config.files.server.routes = getGlobbedPaths(assets.server.routes);

    // Setting Globbed config files
    config.files.server.configs = getGlobbedPaths(assets.server.config);

    // Setting Globbed socket files
    config.files.server.sockets = getGlobbedPaths(assets.server.sockets);

    // Setting Globbed policies files
    config.files.server.policies = getGlobbedPaths(assets.server.policies);

    // Setting Globbed js files
    config.files.client.js = getGlobbedPaths(assets.client.lib.js, 'public/').concat(getGlobbedPaths(assets.client.js, ['client/', 'public/']));

    // Setting Globbed css files
    config.files.client.css = getGlobbedPaths(assets.client.lib.css, 'public/').concat(getGlobbedPaths(assets.client.css, ['client/', 'public/']));

    // Setting Globbed test files
    config.files.client.tests = getGlobbedPaths(assets.client.tests);
};

/**
 * Initialize global configuration
 */
var initGlobalConfig = function() {
    console.log('[ENVIRONMENT CONFIG] \n%s', JSON.stringify(process.env, undefined, 2));

    // Validate NDOE_ENV existance
    validateEnvironmentVariable();

	// Get the default assets
	var defaultAssets = require(path.join(process.cwd(), 'config/assets/default'));

	// Get the current assets
    var assetsEnvironment = !!process.env.IS_AWS && process.env.NODE_ENV === 'development' ? 'dev-aws' : process.env.NODE_ENV;
    var environmentAssets = require(path.join(process.cwd(), 'config/assets/', assetsEnvironment)) || {};

	// Merge assets
	var assets = _.extend(defaultAssets, environmentAssets);

    // Get the default config
    var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

    // Get the current config
    var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

    // Merge config files
    var config = _.merge(defaultConfig, environmentConfig);

    // Initialize global globbed files
    initGlobalConfigFiles(config, assets);

    // Initialize global globbed folders
    initGlobalConfigFolders(config, assets);

    // Expose configuration utilities
    config.utils = {
        getGlobbedPaths: getGlobbedPaths,
        isDevMode: isDevMode
    };

    return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
