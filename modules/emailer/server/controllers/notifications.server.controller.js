'use strict';

exports.send = send;
exports.sendSMS = sendSMS;
exports.sendEmail = sendEmail;
exports.loadRequest = loadRequest;
exports.processRequest = processNewRequest;

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

function processShareRequest(requestMessage, sender) {
	var recipient, emails, phoneNumbers;

	log.debug({ func: 'processShareRequest', requestMessage: requestMessage }, 'START');

	if (_.isObject(requestMessage.to) && !_.isEmpty(requestMessage.to)) {
		recipient = requestMessage.to;
	} else if (_.isObject(requestMessage.to) && !_.isEmpty(requestMessage.to)) {
		recipient = User.findById(requestMessage.to).select('firstName lastName displayName phone email').exec();
	} else {
		emails = requestMessage.contactInfo.emails;
		phoneNumbers = requestMessage.contactInfo.phoneNumbers;

		recipient = requestMessage.contactInfo;
	}

	//log.debug({ func: 'processShareRequest', sender: sender, from_ID: requestMessage.from._id.toString(), stringQ: _.isString(requestMessage.from), fromId: requestMessage.from.id, from_id: requestMessage.from._id }, 'Evaluating sender');

	if (_.isEmpty(sender)) {
		sender = User.findById(requestMessage.from._id || requestMessage.from).select('firstName lastName displayName phone email').exec();
	}

	return Q.all({ recipient: recipient, sender: sender })
		.then(function (results) {
			// Handle sending...
			var target = results.recipient;
			var sender = results.sender;

			log.debug({ func: 'processShareRequest', recipient: target, sender: sender }, 'Configuring info for Notification');

			if (_.isEmpty(target.email) && !_.isEmpty(target.emails)) {
				target.email = getBest(target.emails);
				log.debug({ func: 'processShareRequest', email: target.email }, 'Got Best Email for User');
			}

			if (_.isEmpty(target.phone) && !_.isEmpty(target.phoneNumbers)) {
				target.phone = getBest(target.phoneNumbers);
				log.debug({ func: 'processShareRequest', email: target.phone }, 'Got Best phone for User');
			}

			if (_.isEmpty(target.email) && _.isEmpty(target.phone)) {
				log.debug({ func: 'processShareRequest', target: target }, 'Can\'t continue - both email and phone are empty');
				throw new Error('No Available Contact Information');
			}


			log.debug({ func: 'processShareRequest' }, 'Configuring options...');
			var options = [
				{ name: 'SENDER_NAME', content: sender.firstName || sender.displayName },
				{ name: 'FIRST_NAME', content: target.firstName || target.displayName },
				{ name: 'LAST_NAME', content: target.lastName },
				{ name: 'RECIPIENT_NAME', content: target.displayName || target.firstName || target.lastName },
				{ name: 'EMAIL', content: target.email },
				{ name: 'PHONE', content: target.phone },
				{ name: 'LINK_ID', content: requestMessage.id },
				{ name: 'SHORT_ID', content: requestMessage.shortId },
				{ name: 'MESSAGE', content: requestMessage.text }
			];

			if (!!target.email) {
				log.debug({ func: 'processShareRequest', email: target.email, options: options }, 'Notifying request recipient via email');
				emailer.sendTemplateBySlug('profile-share-request', target, options);
			} else if (!!target.phone) {
				log.debug({ func: 'processShareRequest', phone: target.phone, options: options }, 'Notifying request recipient via phone');
				messenger.sendTemplate('profile-share-request-sms', options);
			}
		});
}

function getBest(contacts) {
	log.debug({ func: 'getBest', source: contacts }, 'Loading best contact from source');

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
					var url = null;
					log.info({ func: 'loadRequest', fromId: fromId, requestType: requestMessage.requestType }, 'Redirecting based on request type');
					switch (requestMessage.requestType) {
						case 'friendRequest':
							break;
						case 'shareRequest':
							url = '/drivers/' + fromId + '/reports?requestId=' + requestMessage.id;
							log.info({ func: 'loadRequest', url: url }, 'Redirecting user to Report Documents');
							return res.redirect(url);
						case 'reviewRequest':
							url = '/reviews/create?requestId=' + requestMessage.id;
							log.info({ func: 'loadRequest', url: url }, 'Redirecting user to Review Creation');
							return res.redirect(url);
						default: log.error({ func: 'loadRequest' }, 'Unknown Request Type');
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