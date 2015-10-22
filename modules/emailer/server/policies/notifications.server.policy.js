'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl'),
	passport = require('passport');

var passport = require('passport');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke notifications Permissions
 */
exports.invokeRolesPolicies = function () {
	acl.allow([{
		roles: ['admin'],
		allows: [
			{
				resources: '/api/notifications',
				permissions: '*'
			}, {
				resources: '/api/notifications/sms',
				permissions: '*'
			},
			{
				resources: '/api/notifications/email',
				permissions: '*'
			}
		]
	}, {
			roles: ['user'],
			allows: [
				{
					resources: '/api/notifications',
					permissions: ['get', 'post']
				}, {
					resources: '/api/notifications/sms',
					permissions: ['get', 'post']
				}, {
					resources: '/api/notifications/email',
					permissions: ['get']
				}
			]
		},
		{
			roles: ['guest'],
			allows: [
				{
					resources: '/r/:shortId',
					permissions: []
				}
			]
		}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed =
function (req, res, next) {
	passport.authenticate('bearer', { session: false },
		function cb(err, user, info) {
			if (err) { return next(err); }

			req.log.debug({ func: 'notifications.policy.isAllowed' },
				'Policy Check : Start');

			var roles = (req.user) ? req.user.roles : ['guest'];

			// Check for user roles
			acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
				if (err) {
					req.log.error({ func: 'notifications.policy.isAllowed', error: err }, '%s user caused an error', roles);
					// An authorization error occurred.
					return res.status(500).send('Unexpected authorization error');
				} else {
					if (isAllowed) {
						req.log.debug({ func: 'notifications.policy.isAllowed' }, '%s user is allowed!', roles);
						// Access granted! Invoke next middleware
						return next();
					} else {
						req.log.warn({ func: 'notifications.policy.isAllowed' }, '%s user is not allowed', roles);
						return res.status(403).json({
							message: 'User is not authorized'
						});
					}
				}
			});

		})(req, res, next);
};
	//];
