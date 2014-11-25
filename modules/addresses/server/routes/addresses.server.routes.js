'use strict';

module.exports = function(app) {
	var users = require('../../../../modules/users/server/controllers/users.server.controller');
	var addresses = require('../../../../modules/addresses/server/controllers/addresses.server.controller');

	// Addresses Routes
	app.route('/api/addresses')
		.get(addresses.list)
		.post(users.requiresLogin, addresses.create);

	app.route('/api/addresses/:addressId')
		.get(addresses.read)
		.put(users.requiresLogin, addresses.hasAuthorization, addresses.update)
		.delete(users.requiresLogin, addresses.hasAuthorization, addresses.delete);

	// Finish by binding the Address middleware
	app.param('addressId', addresses.addressByID);
};
