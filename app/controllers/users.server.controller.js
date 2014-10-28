'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
<<<<<<< HEAD
    require('./users/users.authentication'),
    require('./users/users.authorization'),
    require('./users/users.password'),
    require('./users/users.profile')
);
=======
	require('./users/users.authentication.server.controller'),
	require('./users/users.authorization.server.controller'),
	require('./users/users.password.server.controller'),
	require('./users/users.profile.server.controller')
);
>>>>>>> a7243763ea765d2ce4a837bb8fe138355f9e8640
