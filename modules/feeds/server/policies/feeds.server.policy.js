'use strict';


var path = require('path'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'feeds',
        file: 'server.policy'
    });

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Feeds Permissions
 * ----------------------------------------------------------------------------
 * @summary ADMIN users can do anything
 * @summary Logged in USER users can only access items in their own feed
 * @summary GUEST users cannot see anything unless the item is marked as public
 */
exports.invokeRolesPolicies = function () {
	acl.allow([{
		roles: ['admin'],
		allows: [{
			resources: '/api/feed',
			permissions: '*'
		}, {
				resources: '/api/feeds',
				permissions: '*'
			}, {
				resources: '/api/feed/:feedItemId',
				permissions: '*'
			}]
	}, {
			roles: ['user'],
			allows: [{
				resources: '/api/feed',
				permissions: []
			}, {
					resources: '/api/feed/:feedItemId',
					permissions: ['get']
				}]
		}, {
			roles: ['guest'],
			allows: []
		}]);
};

exports.feedIsAllowed = function (req, res, next) {
	// If an feed is being processed and the current user created it then allow any manipulation
	if (!!req.feed && !!req.user && req.feed.id === req.user.id) {
		req.log.debug('Feed user equals request user');
		return next();
	}

	req.log.debug({func: 'feedIsAllowed'}, 'Couldn`t short circuit - checking ACLs');
	exports.isAllowed(req, res, next);
}

exports.feedItemIsAllowed = function (req, res, next) {
	// If a feedItem is marked as "PUBLIC", allow the route to continue
	if (req.method.toLowerCase() === 'get' && req.feedItem && !!req.feedItem.isPublic) {
		return next();
	}
	
	req.log.debug({item: req.feedItem, user: req.user, itemUser: req.feedItem.user}, 'checking user permissions')
	
	if(!!req.feedItem && !!req.user && req.user._id.equals(req.feedItem.user)) {
		req.log.debug('Feed Item user equals request user');
		return next();
	}

	req.log.debug({func: 'feedItemIsAllowed'}, 'Couldn`t short circuit - checking ACLs');
	exports.isAllowed(req, res, next);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function (req, res, next) {
	req.log.debug({user: req.user}, 'Wheres the user!');
	
	var roles = (req.user) ? req.user.roles : ['guest'];

	req.log.debug({ func: 'isAllowed', roles: roles.join(','), 
		feed: req.feed, feedItem: req.feedItem, user: req.user }, 
		'Checking Roles against ACL');

	// Check for user roles
	acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
		if (err) {
			// An authorization error occurred.
			return res.status(500).send('Unexpected authorization error');
		} else {
			if (isAllowed) {
				// Access granted! Invoke next middleware
				return next();
			} else if(!!req.user) {
				return res.status(403).json({
					message: 'User is not authorized'
				});
				
			} else {
				return res.status(404).send();
			}
		}
	});
};
