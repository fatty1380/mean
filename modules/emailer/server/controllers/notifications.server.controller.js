'use strict';

exports.send = send;
exports.sendSMS = sendSMS;
exports.sendEmail = sendEmail;

var _ = require('lodash'),
	path = require('path'),
	messenger = require('../controllers/messenger.server.controller'),
	emailer = require('../controllers/emailer.server.controller'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'notifications',
        file: 'controller'
    });

function send(req, res) {
	log.debug({ func: 'send', body: req.body }, 'Send : START');
	
	return res.status(504).send({ message: 'Not Implemnted' });
}

function sendEmail(req, res) {
	log.debug({ func: 'sendEmail', body: req.body }, 'Send Email : START');
	
	return res.status(504).send({ message: 'Not Implemnted' });
}

function sendSMS(req, res) {
	var contactInfo = req.body;

	log.debug({ func: 'sendSMS', body: contactInfo }, 'Send SMS : START');

	if (_.isEmpty(contactInfo.phones) && _.isEmpty(contactInfo.phone)) {
		return res.status(422).send({ message: 'must define phone numbers in request' });
	}

	var messageConfig = {
		to: contactInfo.phone || contactInfo.phones,
		from: req.user
	};

	messenger.sendMessage(messageConfig).then(
		function success(sendMessageResponse) {
			return res.status(200).send({ message: 'Successfully sent SMS Message to recipient' });
		},
		function failure(err) {
			log.error({ err: err, messageConfig: messageConfig }, 'Failed to Send SMS Message');
			return res.status(500).send({ message: 'error sending SMS Message to recipient' });
		}
		);
}