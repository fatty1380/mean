'use strict';

var path = require('path'),
	passport = require('passport'),
	oauth2orize = require('oauth2orize'),
	crypto = require('crypto'),
	mongoose = require('mongoose'),
	config = require(path.resolve('./config/config')),
	log = require(path.resolve('./config/lib/logger')).child({
        module: 'auth',
        file: 'oauth2'
    });


log.debug({ func: 'init' }, 'Creating a server');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

var User = mongoose.model('User'),
	AccessToken = mongoose.model('AccessToken'),
	RefreshToken = mongoose.model('RefreshToken');

log.debug({ func: 'init', server: server }, 'Setting up the password');

/**
 * Exchange username & password for an access token.
 *  */
server.exchange(oauth2orize.exchange.password(
	function (client, username, password, scope, done) {

		log.debug({ func: 'oauth2.password' }, 'Searching for user: %s', username);
		
		var regexSearch = new RegExp('^' + escapeRegExp(username) + '$', 'i');

		User.findOne({ username: { $regex: regexSearch } }, function (err, user) {
			if (err) { 
				log.error({ func: 'oauth2.password', err: err }, 'lookup failed due to error');
				return done(err); }
			if (!user) { 
				log.info({ func: 'oauth2.password'}, 'lookup failed: no user found');
				return done(null, false); }

			if (!user.authenticate(password)) {
				log.debug({ func: 'oauth2.password' }, 'lookup failed: incorrect password');
				return done(null, false);
			}

			log.debug({ func: 'oauth2.password', user: user }, 'lookup successful');
			
			generateTokens({ userId: user.id, clientId: client.clientId }, done);
		});
	}));

log.debug({ func: 'init', server: server }, 'Setting up the refreshToken');

/** 
 * Exchange refreshToken for an access token.
 * */ 
server.exchange(oauth2orize.exchange.refreshToken(
	function (client, refreshToken, scope, done) {

	log.debug({ func: 'auth2.refreshToken', clientId: client.clientId }, 'Searching for Valid Refresh Token');
		
	RefreshToken.findOne({ token: refreshToken, clientId: client.clientId }, function(err, token) {
		if (err) { 
	log.error({ func: 'auth2.refreshToken', err:err }, 'Error Searching for Refresh Token');
			return done(err); 
		}

		if (!token) { 
			log.debug({ func: 'auth2.refreshToken' }, 'No Valid Refresh Token Found');
			return done(null, false); 
		}

		User.findById(token.userId, function(err, user) {
			log.debug({ func: 'auth2.refreshToken' }, 'Found Valid Refresh Token Found');
			if (err) { return done(err); }
			if (!user) { return done(null, false); }

			generateTokens({  userId: user.id,  clientId: client.clientId  }, done);
		});
	});
}));


function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Generic error handler
var errFn = function (cb, err) {
	if (err) { 
		return cb(err); 
	}
};

// Destroys any old tokens and generates a new access and refresh token
function generateTokens(data, done) {

	// curries in `done` callback so we don't need to pass it
    var errorHandler = errFn.bind(undefined, done), 
	    refreshToken,
	    refreshTokenValue,
	    token,
		tokenValue;
		
		
	log.debug({ func: 'generateTokens' }, 'Removing existing tokens');

    RefreshToken.remove(data, errorHandler);
    AccessToken.remove(data, errorHandler);

	log.debug({ func: 'generateTokens' }, 'Generating new tokens');
    tokenValue = crypto.randomBytes(32).toString('hex');
    refreshTokenValue = crypto.randomBytes(32).toString('hex');

    data.token = tokenValue;
    token = new AccessToken(data);

    data.token = refreshTokenValue;
    refreshToken = new RefreshToken(data);

	log.debug({ func: 'generateTokens', refreshToken: refreshToken }, 'Saving refreshToken');
    refreshToken.save(errorHandler);

	log.debug({ func: 'generateTokens', accessToken: token }, 'Saving Access token');
    token.save(function (err) {
		
    	if (err) {
			log.error({ func: 'generateTokens', cb: 'token.save' }, 'Failed to save token', err);
    		return done(err); 
		}
		
	log.debug({ func: 'generateTokens' }, 'Saved token!');
		log.debug({ func: 'generateTokens', token: token, tokenVal: tokenValue, refresh: refreshTokenValue }, 'Returning Tokens!');
    	done(null, tokenValue, refreshTokenValue, { 
    		'expires_in': config.security.tokenLife 
    	});
    });
}

// token endpoint
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];