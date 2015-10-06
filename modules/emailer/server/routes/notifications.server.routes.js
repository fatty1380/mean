'use strict';

module.exports = function (app) {
	var notifications = require('../controllers/notifications.server.controller'),
		notificationsPolicy = require('../policies/notifications.server.policy'),
		path = require('path'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'notifications',
        file: 'server.routes'
    });
		
	log.error('NOTIFICATIONS.SERVER.ROUTES - Initializing');

	// Messages Routes
	app.route('/api/notifications')
		.all(notificationsPolicy.isAllowed)
		.post(notifications.send);
		
	app.route('/api/notifications/email')
		.all(notificationsPolicy.isAllowed)
		.post(notifications.sendEmail);
	
	app.route('/api/notifications/sms')
		.all(notificationsPolicy.isAllowed)
		.post(notifications.sendSMS);
		
		
	
	////////////////////////////////////////////////////////////////////////////
	
	app.route('/r/:shortId')
		.get(notifications.loadRequest);
};