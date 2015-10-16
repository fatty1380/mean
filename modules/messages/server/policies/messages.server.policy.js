'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl'),
	passport = require('passport');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Messages Permissions
 */
exports.invokeRolesPolicies = function () {
	acl.allow([{
		roles: ['admin'],
		allows: [{
			resources: '/api/messages',
			permissions: '*'
		}, {
				resources: '/api/messages/:messageId',
				permissions: '*'
			},
			{
				resources: '/api/users/:userId/messages',
				permissions: '*'
			}]
	}, {
			roles: ['user'],
			allows: [{
				resources: '/api/messages',
				permissions: ['get', 'post']
			}, {
					resources: '/api/messages/:messageId',
					permissions: ['get']
				}, {
					resources: '/api/chats',
					permissions: ['get']
				}, {
					resources: '/api/chats/:userId',
					permissions: ['get', 'put']
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

	// If an message is being processed and the current user created it then allow any manipulation
	if (req.message && req.user &&
		req.message.sender.id === req.user.id) {
		req.log.trace({ func: 'message.policy.isAllowed' },
			'Message Sender matches UserId!');
		return next();
	}

	// Check for user roles
	acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
		if (err) {
			req.log.error({ func: 'message.policy.isAllowed', error: err }, '%s user caused an error', roles);
			// An authorization error occurred.
			return res.status(500).send('Unexpected authorization error');
		} else {
			if (isAllowed) {
				req.log.trace({ func: 'message.policy.isAllowed' }, '%s user is allowed!', roles);
				// Access granted! Invoke next middleware
				return next();
			} else {
				req.log.warn({ func: 'message.policy.isAllowed' }, '%s user is not allowed', roles);
				return res.status(403).json({
					message: 'User is not authorized'
				});
			}
		}
	});

		})(req, res, next);
};
