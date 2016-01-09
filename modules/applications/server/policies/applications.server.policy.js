'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Ats Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: [
                '/api/applications',
                '/api/applications/:applicationId',
                '/api/applications/:applicationId/connect',
                '/api/applications/:applicationId/messages',
                '/api/jobs/:jobId/applications',
                '/api/jobs/:jobId/applications/questions',
                '/api/companies/:companyId/applications',
                '/api/users/:userId/applications'
            ],
            permissions: '*'
        }]
    }, {
            roles: ['user'],
            allows: [{
                resources: [
                    '/api/applications',
                    '/api/jobs/:jobId/applications'
                ],
                permissions: ['get', 'post']
            }, {
                    resources: '/api/applications/:applicationId',
                    permissions: ['get', 'put', 'delete', 'patch']
                }, {
                    resources: [
                        '/api/applications/:applicationId/connect'
                    ],
                    permissions: ['post']
                }, {
                    resources: [
                        '/api/applications/:applicationId/messages',
                        '/api/jobs/:jobId/applications/questions',
                        '/api/companies/:companyId/applications',
                        '/api/users/:userId/applications'
                    ],
                    permissions: ['get']
                }]
        }, {
            roles: ['guest'],
            allows: []
        }]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function (req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    if (!!req.user && !!req.application) {
        // If an at is being processed and the current user created it then allow any manipulation
        if (req.application.user.id === req.user.id) {
            req.log.debug({ func: 'hasAuthorization' }, 'Authorized: Driver matches Application User');
            return next();
        }

        if (!!req.user.company && req.application.company.id === req.user.company.id) {
            req.log.debug({ func: 'hasAuthorization' }, 'Authorized: Owner Company matches Application Company');
            return next();
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
};