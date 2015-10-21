'use strict';

exports.process = processNotification;
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
	
// var x = [{
// 	channel: 'user',
// 	event: '.new',
// 	func: 'sendSMS',
// 	content: 'Welcome to TruckerLine! Reply \'YES\' to confirm your mobile number'
// }];

var eventConfig = {};

var defaultEventConfig = {
	'user:new': {emailTemplate: 'sign-up-email', smsTemplate: null},
	'user:update': {emailTemplate: null, smsTemplate: null},
	'inviteRequest:send': {emailTemplate: 'invite-to-truckerline', smsTemplate: '{{FIRST_NAME}} has invited you to TruckerLine. Join the Convoy at http://truckerline.com/r/{{SHORT_ID}}'},
	'friendRequest:send': {emailTemplate: 'new-friend-request', smsTemplate: null},
	'friendRequest:accept': {emailTemplate: 'new-connection', smsTemplate: null},
	'friendRequest:reject': {emailTemplate: null, smsTemplate: null},
	'shareRequest:send': {emailTemplate: 'shared-profile-email', smsTemplate: null},
	'shareRequest:accept': {emailTemplate: null, smsTemplate: null},
	'reviewRequest:send': {emailTemplate: 'new-review-request', smsTemplate: '{{FIRST_NAME}} has requested you review their services on TruckerLine. http://truckerline.com/r/{{SHORT_ID}}'},
	'reviewRequest:accept': { emailTemplate: 'new-review-posted', smsTemplate: null },
	'chatMessage:new': { emailTemplate: 'new-message', smsTemplate: null },
	'orderReports:new': { emailTemplate: null, smsTemplate: null },
	'orderReports:ready': { emailTemplate: null, smsTemplate: null },
	'report-request:new': { emailTemplate: 'request-reminder', smsTemplate: null }
};

initialize();

function initialize(messageConfigs) {
	eventConfig = _.defaults(eventConfig, messageConfigs, defaultEventConfig);
	
	log.debug({ func: 'initialize', config: eventConfig }, 'Notification Center Configured with new settings');
}

function send(event, options) {
	
	var config = eventConfig[event];
	
	if (!config) {
		return { result: false, message: 'No notification configured for event' };
	}
	
	switch (event) {
		case 'user:new':
			return emailer.sendTemplateBySlug(config.emailTemplate, options.user, options);
	}
	
	if (!!options.requestMessage) {
		return processNewRequest(options.requestMessage, options.user);
	}
}

function processNewRequest(requestMessage, sender) {
	var recipient, emails, phoneNumbers;
	
	var config = eventConfig[requestMessage.requestType + ':new'];

	log.debug({ func: 'processShareRequest', requestMessage: requestMessage, config: config }, 'START');

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
				{ name: 'SENDER_ID', content: sender.id },
				{ name: 'SENDER_NAME', content: sender.firstName || sender.displayName },
				{ name: 'FIRST_NAME', content: target.firstName || target.displayName },
				{ name: 'LAST_NAME', content: target.lastName },
				{ name: 'RECIPIENT_NAME', content: target.displayName || target.firstName || target.lastName },
				{ name: 'EMAIL', content: target.email },
				{ name: 'PHONE', content: target.phone },
				{ name: 'LINK_ID', content: requestMessage.id },
				{ name: 'SHORT_ID', content: requestMessage.shortId },
				{ name: 'MESSAGE', content: requestMessage.text },
				{ name: 'PROFILE_IMAGE', content: sender.profileImageURL || sender.props && sender.props.avatar }
			];

			if (!!target.email && config.emailTemplate) {
				log.debug({ func: 'processShareRequest', email: target.email, options: options }, 'Notifying request recipient via email');
				emailer.sendTemplateBySlug(config.emailTemplate, target, options);
			} else if (!!target.phone && config.smsTemplate) {
				log.debug({ func: 'processShareRequest', phone: target.phone, options: options }, 'Notifying request recipient via phone');
				messenger.sendMessage(config.smsTemplate, { vars: options });
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

function processNotification(req, res) {
	log.debug({ func: 'send', body: req.body }, 'Send : START');

	return res.status(504).send({ message: 'Not Implemnted' });
}

function sendEmail(req, res) {
	log.debug({ func: 'sendEmail', body: req.body }, 'Send Email : START');

	return res.status(504).send({ message: 'Not Implemnted' });
}

function sendSMS(req, res) {
	var contactInfo = req.body;
	var message = req.body.message || 'This is a Test of the TruckerLine SMS Messaging System';

	log.debug({ func: 'sendSMS', body: contactInfo, reqUser: req.user }, 'Send SMS : START');

	if (_.isEmpty(contactInfo.phoneNumbers) && _.isEmpty(contactInfo.phone)) {
		return res.status(422).send({ message: 'must define phone numbers in request' });
	}

	var messageConfig = {
		to: contactInfo.phone || contactInfo.phoneNumbers,
		from: req.user
	};

	messenger.sendMessage(message, messageConfig).then(
		function success(sendMessageResponse) {
			return res.status(200).send({ message: 'Sent SMS Message to recipient', sid: sendMessageResponse.sid, status: sendMessageResponse.status });
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