'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Messages Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['admin'],
		allows: [{
			resources: '/api/messages',
			permissions: '*'
		}, {
			resources: '/api/messages/:messageId',
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
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an message is being processed and the current user created it then allow any manipulation
	if (req.message && req.user &&
		req.message.sender.id === req.user.id) {
		return next();
	}

	// Check for user roles
	acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
		if (err) {
			req.log.error({ error: err }, '%s user caused an error', roles);
			// An authorization error occurred.
			return res.status(500).send('Unexpected authorization error');
		} else {
			if (isAllowed) {
				req.log.debug('%s user is allowed!', roles);
				// Access granted! Invoke next middleware
				return next();
			} else {
				req.log.warn('%s user is not allowed', roles);
				return res.status(403).json({
					message: 'User is not authorized'
				});
			}
		}
	});
};
