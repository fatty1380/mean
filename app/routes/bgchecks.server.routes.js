'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var bgchecks = require('../../app/controllers/bgchecks');

	// Bgchecks Routes
	app.route('/bgchecks')
		.get(bgchecks.list)
		.post(users.requiresLogin, bgchecks.create);

	app.route('/bgchecks/:bgcheckId')
		.get(bgchecks.read)
		.put(users.requiresLogin, bgchecks.hasAuthorization, bgchecks.update)
		.delete(users.requiresLogin, bgchecks.hasAuthorization, bgchecks.delete);

	// Finish by binding the Bgcheck middleware
	app.param('bgcheckId', bgchecks.bgcheckByID);
};