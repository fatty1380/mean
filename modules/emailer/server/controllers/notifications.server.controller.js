'use strict';

exports.send = send;
exports.sendSMS = sendSMS;
exports.sendEmail = sendEmail;
exports.loadRequest = loadRequest;

var _ = require('lodash'),
	path = require('path'),
    mongoose = require('mongoose'),
	Q = require('q'),
	messenger = require('../controllers/messenger.server.controller'),
	emailer = require('../controllers/emailer.server.controller'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'notifications',
        file: 'controller'
    });

var User = mongoose.model('User'),
	RequestMessage = mongoose.model('RequestMessage');
	
///////////////////////////////////////////////////////////////////////////
	
var x = [{
	channel: 'user',
	event: '.new',
	func: 'sendSMS',
	content: 'Welcome to TruckerLine! Reply \'YES\' to confirm your mobile number'
}];

function initalize(messageConfigs) {
	messageConfigs = messageConfigs || x;

	_.each(messageConfigs, function (subConf) {
		var channelName = subConf.channel + (subConf.event || '');
		messenger.subscribe(channelName, function (message) {
			var fn = exports[subConf.func];

			messenger.on(channelName, function (doc) {
				fn(doc);
			});
		});
	});
}

function processNewRequest(request) {
	switch (request.requestType) {
		case 'friendRequest':
			break;
		case 'shareRequest':
			processShareRequest(request);
			break;
		case 'reviewRequest':
			break;
	}
}

function processShareRequest(requestMessage) {
	var recipient, emails, phoneNumbers;

	if (_.isObject(requestMessage.to) && !_.isEmpty(requestMessage.to)) {
		recipient = requestMessage.to;
	} else if (_.isObject(requestMessage.to) && !_.isEmpty(requestMessage.to)) {
		recipient = User.findById(requestMessage.to).select('firstName lastName displayName phone email').exec();
	} else {
		emails = requestMessage.contactInfo.emails;
		phoneNumbers = requestMessage.contactInfo.phoneNumbers;

		recipient = requestMessage.contactInfo;
	}

	return Q.when(recipient, function (target) {
		// Handle sending...
		
		if (_.isEmpty(target.email) && !_.isEmpty(target.emails)) {
			target.email = getBest(target.emails);
		}

		if (_.isEmpty(target.phone) && !_.isEmpty(target.phoneNumbers)) {
			target.phone = getBest(target.phoneNumbers);
		}

		if (_.isEmpty(target.email) && _.isEmpty(target.phone)) {
			throw new Error('No Available Contact Information');
		}

		var options = [
			{ name: 'FIRST_NAME', content: target.firstName },
			{ name: 'LAST_NAME', content: target.lastName },
			{ name: 'DISPLAY_NAME', content: target.displayName },
			{ name: 'EMAIL', content: target.email },
			{ name: 'PHONE', content: target.phone },
			{ name: 'LINK_ID', content: requestMessage.id },
			{ name: 'SHORT_ID', content: requestMessage.shortId },
		];

		if (!!target.email) {
			emailer.sendTemplateBySlug('profile-share-request', options);
		} else if (!!target.phone) {
			messenger.sendTemplate('profile-share-request-sms', options);
		}
	});
}

function getBest(contacts) {
	var pref = _.find(contacts, { pref: true });

	if (!!pref && !_.isEmpty(pref.value)) {
		return pref.value;
	}

	_.forEach(contacts, function (e) {
		if (!_.isEmpty(e.value)) {
			pref = e.value;
			return false;
		}
	});

	return pref;
}

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

	if (_.isEmpty(contactInfo.phoneNumbers) && _.isEmpty(contactInfo.phone)) {
		return res.status(422).send({ message: 'must define phone numbers in request' });
	}

	var messageConfig = {
		to: contactInfo.phone || contactInfo.phoneNumbers,
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

//////////////////////////////////////////////////////

var shortid = require('shortid');

function loadRequest(req, res) {
	log.info({ func: 'loadRequest', params: req.params }, 'Loading Notification Request');
	var id = req.params.shortId;

	if (shortid.isValid(id)) {
		log.info({ func: 'loadRequest', shortId: id }, 'Looking up By ShortID?');
		return RequestMessage.findOne({ shortId: id }).exec().then(
			function success(requestMessage) {
				log.info({ func: 'loadRequest', reqMsg: requestMessage }, 'Found Request Message');
				var fromId = requestMessage.from.id || requestMessage.from;
				if (!!requestMessage && !!fromId) {

					log.info({ func: 'loadRequest', fromId: fromId, requestType: requestMessage.requestType }, 'Redirecting based on request type');
					switch (requestMessage.requestType) {
						case 'friendRequest':
							break;
						case 'shareRequest':
							var url = '/drivers/' + fromId + '/reports?requestId=' + requestMessage.id;
							log.info({ func: 'loadRequest', url: url }, 'Redirecting user to Report Documents');
							return res.redirect(url);
						case 'reviewRequest':
							var url = '/reviews/create?requestId=' + requestMessage.id;
							log.info({ func: 'loadRequest', url: url }, 'Redirecting user to Review Creation');
							return res.redirect(url);
						default: log.error({ func: 'loadRequest' }, 'Unknown Request Type')
					}
				} else if (!fromId) {
					log.error({ requestMesage: requestMessage }, 'Request has no sender');
				} else {
					log.error({ requestMessage: requestMessage }, 'Unable to process request');
				}

				return res.redirect('/not-found');
			},
			function fail(err) {
				log.error({ err: err, params: req.params }, 'Unable to load request');
				return res.redirect('/not-found');
			});
	}
	else {
		return res.redirect('/not-found');
	}
}