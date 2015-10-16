'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	User = require('mongoose').model('User'),
	path = require('path'),
	config = require(path.resolve('./config/config'));

var log = require(path.resolve('./config/lib/logger')).child({
	module: 'users',
	file: 'config'
});

module.exports = function (app, db) {
	// Serialize sessions
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	// Deserialize sessions
	passport.deserializeUser(function (id, done) {
		User.findOne({
			_id: id
		}, '-salt -password', function (err, user) {
			done(err, user);
		});
	});

	// Initialize strategies
	config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(function (strategy) {
		log.debug({ func: 'exports' }, 'Initializing Strategy for %s', strategy.split('/').pop());
		require(path.resolve(strategy))(config);
	});

	// Add passport's middleware
	log.debug({ func: 'exports' }, 'Initializing Passport');
	app.use(passport.initialize());

	if (!!config.security.enableSession) {
		log.debug({ func: 'exports' }, 'Setting Session Auth');
		app.use(passport.session());
	}
    
	if (!!config.security.enableJWT) {
		log.debug({ func: 'exports' }, 'Setting JWT Bearer Auth');
		//app.use(passport.authenticate('bearer', { session: false }));
		//app.use('/api', passport.authenticate('bearer', { session: false }));
	}
};


