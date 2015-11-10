'use strict';

module.exports = function (app) {
	var notifications = require('../controllers/notifications.server.controller'),
		notificationsPolicy = require('../policies/notifications.server.policy'),
		path = require('path'),
		passport = require('passport'),
		log = require(path.resolve('./config/lib/logger')).child({
			module: 'notifications',
			file: 'server.routes'
		});

	// Messages Routes
	app.route('/api/notifications')
		.all(notificationsPolicy.isAllowed)
		.post(notifications.send);		
	
	////////////////////////////////////////////////////////////////////////////
	
	app.route('/r/:shortId')
		.all(notificationsPolicy.isAllowed)
		.get(notifications.loadRequest);
};