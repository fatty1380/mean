'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
path = require('path')	,
	log = require(path.resolve('./config/lib/logger')).child({
        module: 'users',
        file: 'auth.routes'
    });

var oauth2 = require(path.resolve('./config/lib/oauth2'));

module.exports = function (app) {
	/* User Routes */
	var users = require('../controllers/users.server.controller');
	
	app.route('/')
	.get(
		function (req, res, next) {
			req.log.debug({ func: 'get slash', user: req.user, headers: req.headers }, 'authenticated?');
			next();
		}
		, passport.authenticate('bearer', { session: false }));
	
	/**
	 * Allowing for JWT Based Authentication
	 */
	log.info({ func: 'init', token: oauth2.token }, 'Initializing JWT Routes');
	// app.route('/oauth/token')
	// 	.all(function (req, res, next) {
	// 		req.log.debug('OAUTH TOKEN TEST')
	// 		next();
	// 	})
	// 	.post(oauth2.token);
		
	app.route('/oauth/token').post(oauth2.token[0], oauth2.token[1], oauth2.token[2]);

	/* Setting up the users password api */
	app.route('/api/auth/forgot').post(users.forgot);
	app.route('/api/auth/reset/:token').get(users.validateResetToken);
	app.route('/api/auth/reset/:token').post(users.reset);

	/* Setting up the users authentication api */
	app.route('/api/auth/signup').post(users.signup);
	app.route('/api/auth/signin').post(users.signin);
	app.route('/api/auth/signout').get(users.signout);
	
	/**
	 * Third Party API Routes
	 */

	/** Setting the facebook oauth routes */
	app.route('/api/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/api/auth/facebook/callback').get(users.oauthCallback('facebook'));

	/** Setting the twitter oauth routes */
	app.route('/api/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/api/auth/twitter/callback').get(users.oauthCallback('twitter'));

	/** Setting the google oauth routes */
	app.route('/api/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/api/auth/google/callback').get(users.oauthCallback('google'));

	/** Setting the linkedin oauth routes */
	app.route('/api/auth/linkedin').get(passport.authenticate('linkedin', {
		scope: [
			'r_basicprofile',
			'r_emailaddress'
		]
	}));
	app.route('/api/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

	/** Setting the github oauth routes */
	app.route('/api/auth/github').get(passport.authenticate('github'));
	app.route('/api/auth/github/callback').get(users.oauthCallback('github'));
};
