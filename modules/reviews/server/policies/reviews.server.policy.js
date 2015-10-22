'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl'),
	passport = require('passport');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Reviews Permissions
 */
exports.invokeRolesPolicies = function () {
	acl.allow([
		{
			roles: ['admin'],
			allows: [
				{
					resources: '/api/reviews',
					permissions: '*'
				}, {
					resources: '/api/reviews/:reviewId',
					permissions: '*'
				}, {
					resources: '/api/profiles/:reviewid/reviews',
					permissions: '*'
				}
			]
		}, {
			roles: ['user'],
			allows: [
				{
					resources: '/api/reviews',
					permissions: ['get', 'post']
				}, {
					resources: '/api/reviews/:reviewId',
					permissions: ['get']
				}, {
					resources: '/api/profiles/:userId/reviews',
					permissions: ['get', 'post']
				}
			]
		}, {
			roles: ['guest'],
			allows: [
				{
					resources: '/api/reviews',
					permissions: ['get']
				}, {
					resources: '/api/reviews/:reviewId',
					permissions: ['get']
				}, {
					resources: '/api/profiles/:userId/reviews',
					permissions: ['get', 'post']
				}
			]
		}
	]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function (req, res, next) {

	passport.authenticate('bearer', { session: false },
		function cb(err, user, info) {
			if (err) { return next(err); }

			var roles = (req.user) ? req.user.roles : ['guest'];

			var ppt = passport.authenticate('bearer', { session: false });

			/** 
			* If an review is being processed and the current user created it then allow any manipulation
			* @note In a review, the "reviewer" is the one who created it.
			*/
			if (req.review && req.user && req.review.reviewer.id === req.user.id) {
				req.log.debug({ module: 'reviews', func: 'isAllowed' }, 'Reviewer is Logged in User');
				return next();
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
					} else if (req.isAuthenticated()) {
						return res.status(403).json({
							message: 'User is not authorized'
						});
					} else {
						return res.status(401);
					}
				}
			});

		})(req, res, next);
};
