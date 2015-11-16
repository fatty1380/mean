'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl'),
	passport = require('passport');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Documents Permissions
 */
exports.invokeRolesPolicies = function () {
	acl.allow([{
		roles: ['admin'],
		allows: [{
			resources: '/api/requests',
			permissions: '*'
		}, {
				resources: '/api/requests/:requestId',
				permissions: '*'
			},
			{
				resources: '/r/:shortId',
				permissions: ['get']
			}]
	}, {
			roles: ['user'],
			allows: [
				{
					resources: '/api/requests',
					permissions: ['get', 'post']
				}, {
					resources: '/api/requests/:requestId',
					permissions: ['get']
				}, {
					resources: '/api/profiles/:userId/requests',
					permissions: ['get']
				},
				{
					resources: '/r/:shortId',
					permissions: ['get']
				}]
		}, {
			roles: ['guest'],
			allows: [
				{
					resources: '/api/requests',
					permissions: ['get']
				}, {
					resources: '/api/requests/:requestId',
					permissions: ['get']
				},
				{
					resources: '/r/:shortId',
					permissions: ['get']
				}]
		}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function (req, res, next) {
	passport.authenticate('bearer', { session: false },
		function cb(err, user, info) {
			if (err) { return next(err); }
			var roles = (req.user) ? req.user.roles : ['guest'];

			// If an document is being processed and the current user created it then allow any manipulation
			if (req.document && req.user && req.document.user.id === req.user.id) {
				return next();
			}

			if (req.isAuthenticated() && !!req.profile) {
				if (req.profile.id === req.user.id) {
					req.log.info({ func: 'isAllowed', file: 'document.policy' }, 'User and Profile are the same ... Granting access');
				}
			}

			// Check for user roles
			acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
				if (err) {
					// An authorization error occurred.
					return res.status(500).send('Unexpected authorization error');
				} else {
					if (isAllowed) {
						// Access granted! Invoke next middleware
						return next();
					} else {
						return res.status(403).json({
							message: 'User is not authorized'
						});
					}
				}
			});

		})(req, res, next);
};
