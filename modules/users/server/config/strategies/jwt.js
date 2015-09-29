'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	path = require('path'),
	mongoose = require('mongoose'),
	config = require(path.resolve('./config/config')),
	log = require(path.resolve('./config/lib/logger')).child({
        module: 'users.auth.strategies',
        file: 'jwt'
    });


var BasicStrategy = require('passport-http').BasicStrategy,
	ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
	BearerStrategy = require('passport-http-bearer').Strategy;

var User = mongoose.model('User'),
	ClientApp = mongoose.model('ClientApplication'),
	AccessToken = mongoose.model('AccessToken');


log.info({ func: 'pre-init' }, 'Initializing new Basic Strategy for Client Lookup');

module.exports = function () {

	/**
	 * BasicStrategy
	 * ------------------
	 * Looks up a Client Model - which represents a client application requesting access on behalf
	 * of the user. This will have a name and a secret code.
	 * 
	 * @example: 
	 */
	log.info({ func: 'init' }, 'Initializing new Basic Strategy for Client Lookup');
	passport.use(new BasicStrategy(
		function (username, password, done) {
			log.trace({ strategy: 'basic', username: username }, 'Looking up client key for username');
			ClientApp.findOne({ clientId: username }, function (err, client) {
				if (err) { return done(err); }
				if (!client) { return done(null, false); }
				if (client.clientSecret !== password) { return done(null, false); }

				log.trace({ strategy: 'basic', username: username }, 'Found client key for username');
				return done(null, client);
			});
		}
		));

	log.info({ func: 'init' }, 'Initializing new ClientPassword Strategy for Client Lookup');
	passport.use(new ClientPasswordStrategy(
		function (clientId, clientSecret, done) {
			log.trace({ strategy: 'client-password', clientId: clientId }, 'Looking up client key for clientId');
			ClientApp.findOne({ clientId: clientId }, function (err, client) {
				if (err) {
					log.error({ strategy: 'client-password', clientId: clientId }, 'Error Looking up client key for clientId');
					return done(err);
				}
				if (!client) {
					log.trace({ strategy: 'client-password', clientId: clientId }, 'No client key found for clientId');
					return done(null, false);
				}
				if (client.clientSecret !== clientSecret) {
					log.trace({ strategy: 'client-password', clientId: clientId }, 'Invalid client secret found for clientId');
					return done(null, false);
				}

				log.trace({ strategy: 'client-password', clientId: clientId }, 'Found client key for clientId');

				return done(null, client);
			});
		}
		));
	
	// Use local strategy
	log.info({ func: 'init' }, 'Initializing new Bearer Strategy for User Lookup');
	passport.use(new BearerStrategy({},
		function (accessToken, done) {
			log.trace({ strategy: 'bearer', token: accessToken }, 'Looking up AccessToken');
			AccessToken.findOne({ token: accessToken }, function (err, token) {
				if (err) { return done(err); }
				if (!token) { return done(null, false); }

				if (Math.round((Date.now() - token.created) / 1000) > config.security.tokenLife) {
					AccessToken.remove({ token: accessToken }, function (err) {
						if (err) { return done(err); }
					});
					return done(null, false, { message: 'Token expired' });
				}

				log.trace({ strategy: 'bearer', token: token }, 'AccessToken is valid. Finding User');
				User.findById(token.userId).exec()
					.then(function (user) {
						if (!user) {
							return done(null, false, {
								message: 'Unknown user'
							});
						}

						var info = { scope: '*' };

						log.trace({ strategy: 'bearer', user: user.id }, 'Found User');

						return done(null, user, info);
					}, function (err) {
						return done(err);
					});
			});
		}));
};


