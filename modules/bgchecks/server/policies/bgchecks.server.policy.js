'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Articles Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/reports/applicants',
            permissions: '*'
        }]
    }, {
        roles: ['user', 'guest'],
        allows: [{
            resources: '/api/reports/types',
            permissions: ['get']
        }]
    }, {
        roles : ['admin', 'user'],
        allows: [{
            resources: '/api/reports/types/:sku/create',
            permissions: ['post']
        },{
            resources: '/api/users/:userId/driver/applicant',
            permissions: ['get', 'post']
        },{
            resources: '/api/reports/applicants/:applicantId',
            permissions: ['get']
        },{
            resources: '/api/reports/types/:sku',
            permissions: '*'
        }
        ]
    }]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function (req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    // If an report is being processed and the current user created it then allow any manipulation
    if (req.report && req.user && req.report.user.id === req.user.id) {
        return next();
    }

    console.log('[ACLPolicy] Validating %j for %s to path %s', roles, req.method, req.route.path);

    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
        if (err) {
            console.error('[ACLPolicy] NOPE - ERROR %j', err);

            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                console.error('[ACLPolicy] Come On In!');
                // Access granted! Invoke next middleware
                return next();
            } else {
                console.error('[ACLPolicy] No sir, door\'s locked!');
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
