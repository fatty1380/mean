'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
	chalk = require('chalk'),
	path = require('path'),
	mongoose = require('mongoose'),
	log = require(path.resolve('./config/lib/logger')).child({
		module: 'lib',
		file: 'mongoose'
	});

// Load the mongoose models
module.exports.loadModels = function() {
	// Globbing model files
	config.files.server.models.forEach(function(modelPath) {
		log.trace('Loading Models at path: %s', modelPath);
		require(path.resolve(modelPath));
	});

	log.trace('Finished loading models');
};

// Initialize Mongoose
module.exports.connect = function(cb) {
	var _this = this;


	log.info(config.db, 'Making connection to MongoDB');

	var db = mongoose.connect(config.db.uri, config.db.options, function (err) {
		// Log Error
		if (err) {
			log.error(err, 'Could not connect to MongoDB!');
			console.log(err);
		} else {
			log.info(config.db, 'Successful connection to MongoDB!');
			// Load modules
			_this.loadModels();

			// Call callback FN
			if (cb) {cb(db);}
		}
	});

	mongoose.connection.on('error', function (err) {
			console.error(chalk.red('MongoDB connection error: ' + err));
			process.exit(-1);
		}
	);
};

module.exports.disconnect = function(cb) {
  mongoose.disconnect(function(err) {
  	console.info(chalk.yellow('Disconnected from MongoDB.'));
  	cb(err);
  });
};
