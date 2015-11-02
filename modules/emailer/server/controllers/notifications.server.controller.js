'use strict';

exports.process = processNotification;
exports.send = send;
exports.sendSMS = sendSMS;
exports.sendEmail = sendEmail;
exports.loadRequest = loadRequest;
exports.processRequest = processRequest;

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
	RequestMessage = mongoose.model('RequestMessage'),
    Login = mongoose.model('Login');
	
///////////////////////////////////////////////////////////////////////////
	
// var x = [{
// 	channel: 'user',
// 	event: '.new',
// 	func: 'sendSMS',
// 	content: 'Welcome to TruckerLine! Reply \'YES\' to confirm your mobile number'
// }];

var eventConfig = {};

var defaultEventConfig = {
	'user:new': { emailTemplate: 'sign-up-email', smsTemplate: null },
	'user:update': { emailTemplate: null, smsTemplate: null },
	'inviteRequest:new': { emailTemplate: 'invite-to-truckerline', smsTemplate: '{{=it.SENDER_NAME}} has invited you to TruckerLine. Join the Convoy at http://app.truckerline.com/r/{{=it.SHORT_ID}}' },
	'friendRequest:new': { emailTemplate: 'new-friend-request', smsTemplate: null },
	'friendRequest:accepted': { emailTemplate: 'new-connection', smsTemplate: null },
	'friendRequest:rejected': { emailTemplate: null, smsTemplate: null },
	'shareRequest:new': { emailTemplate: 'shared-profile-email', smsTemplate: null },
	'shareRequest:accepted': { emailTemplate: null, smsTemplate: null },
	'reviewRequest:new': { emailTemplate: 'new-review-request', smsTemplate: '{{=it.SENDER_NAME}} has requested you review their services on TruckerLine. http://app.truckerline.com/r/{{=it.SHORT_ID}}' },
	'reviewRequest:accepted': { emailTemplate: 'new-review-posted', smsTemplate: null },
	'chatMessage:new': { emailTemplate: 'new-message', smsTemplate: null },
	'orderReports:new': { emailTemplate: null, smsTemplate: null },
	'orderReports:ready': { emailTemplate: null, smsTemplate: null },
	'reportRequest:new': { emailTemplate: 'request-reminder', smsTemplate: null }
};

/**
 * Return Values
 * -------------
 * Each message type, whether SMS or Email, needs to have a semi-consistent return type. The 
 * core bits of information are:
 *   - Success : Boolean
 *   - MessageId : String
 *   - Status : String [Queued, Delivered, Rejected]
 *   - System : String [Twilio, Mandrill]
 */

initialize();

function initialize(messageConfigs) {
	eventConfig = _.defaults(eventConfig, messageConfigs, defaultEventConfig);

	log.debug({ func: 'initialize', config: eventConfig }, 'Notification Center Configured with new settings');
}

function send(event, options) {

	log.info({ func: 'send', event: event, options: options }, 'Sending notification for event `%s`', event);

	var config = eventConfig[event];

	log.info({ func: 'send', config: config }, 'Loaded Config for event `%s`', event);

	if (!config) {
		return { result: false, message: 'No notification configured for event' };
	}

	switch (event) {
		case 'user:new':
			console.warn({ func: 'send' }, 'Sending Template for new user signup');
			return emailer.sendTemplateBySlug(config.emailTemplate, options.user, options);
	}

	if (!!options.requestMessage) {
		return processRequest(options.requestMessage, options.user);
	}
}

function processRequest(requestMessage, sender) {

	var event;

	switch (requestMessage.requestType) {
		case 'friendRequest':
			if (_.isEmpty(requestMessage.to)) {
				event = 'inviteRequest:new';
			}
			else {
				event = 'friendRequest:' + requestMessage.status;
			}
			break;
		case 'shareRequest':
			event = 'shareRequest:' + requestMessage.status;
			break;
		case 'reviewRequest':
			event = 'reviewRequest:' + requestMessage.status;
			break;
		case 'reportRequest':
			event = 'reportRequest:' + requestMessage.status;
			break;
	}

	log.info({ func: 'processRequest', requestMessage: requestMessage, event: event }, 'Processing for event `%s`', event);

	return processNewRequest(event, requestMessage, sender);
}

function processNewRequest(event, requestMessage, sender) {
	var result, recipient, emails, phoneNumbers;

	var config = eventConfig[event];

	if (_.isEmpty(config)) {
		return Q.reject('Invalid Event Configuration');
	}

	log.debug({ func: 'processNewRequest', requestMessage: requestMessage, config: config }, 'START');

	if (_.isObject(requestMessage.to) && !_.isEmpty(requestMessage.to)) {
		recipient = requestMessage.to;
	} else if (_.isObject(requestMessage.to) && !_.isEmpty(requestMessage.to)) {
		recipient = User.findById(requestMessage.to).select('firstName lastName displayName phone email').exec();
	} else {
		emails = requestMessage.contactInfo.emails;
		phoneNumbers = requestMessage.contactInfo.phoneNumbers;

		recipient = requestMessage.contactInfo;
	}

	//log.debug({ func: 'processNewRequest', sender: sender, from_ID: requestMessage.from._id.toString(), stringQ: _.isString(requestMessage.from), fromId: requestMessage.from.id, from_id: requestMessage.from._id }, 'Evaluating sender');

	if (_.isEmpty(sender)) {
		sender = User.findById(requestMessage.from._id || requestMessage.from).select('firstName lastName displayName phone email').exec();
	}

	return Q.all({ recipient: recipient, sender: sender })
		.then(function (results) {
			// Handle sending...
			var target = results.recipient;
			var sender = results.sender;

			log.debug({ func: 'processNewRequest', recipient: target, sender: sender }, 'Configuring info for Notification');

			if (_.isEmpty(target.email) && !_.isEmpty(target.emails)) {
				target.email = getBest(target.emails);
				log.debug({ func: 'processNewRequest', email: target.email }, 'Got Best Email for User');
			}

			if (_.isEmpty(target.phone) && !_.isEmpty(target.phoneNumbers)) {
				target.phone = getBest(target.phoneNumbers);
				log.debug({ func: 'processNewRequest', phone: target.phone }, 'Got Best phone for User');
			}

			if (_.isEmpty(target.phone) && !_.isEmpty(target.phones)) {
				target.phone = getBest(target.phones);
				log.debug({ func: 'processNewRequest', phone: target.phone }, 'Got Best phone for User');
			}

			if (_.isEmpty(target.email) && _.isEmpty(target.phone)) {
				log.debug({ func: 'processNewRequest', target: target }, 'Can\'t continue - both email and phone are empty');
				throw new Error('No Available Contact Information');
			}


			log.debug({ func: 'processNewRequest' }, 'Configuring options...');
			var vars = {
				'SENDER_ID': sender.id,
				'SENDER_NAME': sender.firstName || sender.displayName,
				'FIRST_NAME': target.firstName || target.displayName,
				'LAST_NAME': target.lastName,
				'RECIPIENT_NAME': target.displayName || target.firstName || target.lastName,
				'EMAIL': target.email,
				'PHONE': target.phone,
				'LINK_ID': requestMessage.id,
				'SHORT_ID': requestMessage.shortId,
				'MESSAGE': requestMessage.text,
				'PROFILE_IMAGE': sender.profileImageURL || sender.props && sender.props.avatar
			};
			log.debug({ func: 'processNewRequest', vars: vars, config: config }, 'Configured options... Sending For Config');

			if (!!target.phone && config.smsTemplate) {
				log.debug({ func: 'processNewRequest', phone: target.phone, options: vars }, 'Notifying request recipient via phone');
				return messenger.sendMessage(config.smsTemplate, { vars: vars, to: target.phone });
			} else if (!!target.email && config.emailTemplate) {
				log.debug({ func: 'processNewRequest', email: target.email, options: vars }, 'Notifying request recipient via email');
				return emailer.sendTemplateBySlug(config.emailTemplate, target, vars);
			}
		})
		.then(function (sendResult) {
			debugger;
			log.info({ func: 'processNewRequest', stage: 'sendResult', result: sendResult }, 'Got result from send');


			if (!_.isEmpty(sendResult.sid)) {
				result = {
					success: sendResult.status !== 'rejected',
					status: sendResult.status,
					messageId: sendResult.sid,
					system: 'twilio',
					method: 'sms',
					recipient: sendResult.to,
					message: sendResult.body
				};
			}
			else {
				result = {
					success: _.isEmpty(sendResult.reject_reason),
					status: sendResult.status,
					messageId: sendResult._id,
					system: 'mandrill',
					method: 'email',
					recipient: sendResult.email
				};
			}

			if (result.success && requestMessage.status === 'new') {
				log.debug('Setting `new` status to `sent` after success');
				requestMessage.status = 'sent';

				return requestMessage.save();
			}

			return requestMessage;
		})
		.then(function (saveResult) {
			result.requestMessage = saveResult.toObject();

			return result;

		});
}

function getBest(contacts) {
	log.debug({ func: 'getBest', source: contacts }, 'Loading best contact from source');

	var pref = _.find(contacts, { pref: true });

	if (!!pref && !_.isEmpty(pref.value)) {
		return pref.value;
	}

	_.forEach(contacts, function (e) {
		log.debug({ func: 'getBest', contact: e }, 'Evaluating Current Contact');
		if (!_.isEmpty(e.value) && e.value !== 'undefined') {
			log.debug({ func: 'getBest', best: e }, 'Got It (value)!');
			pref = e.value;
			return false;
		}
		if (_.isString(e) && !_.isEmpty(e) && e !== 'undefined') {
			log.debug({ func: 'getBest', best: e }, 'Got It (string)!');
			pref = e;
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

	// TODO: Remap this setup
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
	req.log.info({ func: 'loadRequest', params: req.params }, 'Loading Notification Request');
	var id = req.params.shortId;
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	if (shortid.isValid(id)) {
		req.log.info({ func: 'loadRequest', shortId: id }, 'Looking up By ShortID?');

		return RequestMessage.findOne({ shortId: id }).exec().then(
			function success(requestMessage) {
				req.log.info({ func: 'loadRequest', reqMsg: requestMessage }, 'Found Request Message');
				var fromId = requestMessage.from.id || requestMessage.from;

				if (!!requestMessage && !!fromId) {
					var url = null;
					req.log.info({ func: 'loadRequest', fromId: fromId, requestType: requestMessage.requestType }, 'Redirecting based on request type');

					switch (requestMessage.requestType) {
						case 'friendRequest':
							(new Login({ input: requestMessage.shortId, result: 'referral', userId: requestMessage.user, ip: ip })).save().end(_.noop());
							return res.redirect('http://www.truckerline.com');
							
						case 'shareRequest':
							url = '/truckers/' + fromId + '?requestId=' + requestMessage.id;
							req.log.info({ func: 'loadRequest', url: url }, 'Redirecting user to Report Documents');
							return res.redirect(url);
							
						case 'reviewRequest':
							// if (!!requestMessage.objectLink) {
							// 	url = '/reviews/' + requestMessage.objectLink + '/edit';
							// } else {
							url = '/reviews/create?requestId=' + requestMessage.id;
							//}
							req.log.info({ func: 'loadRequest', url: url }, 'Redirecting user to Review Creation');
							return res.redirect(url);
						default: req.log.error({ func: 'loadRequest' }, 'Unknown Request Type');
					}
				} else if (!fromId) {
					req.log.error({ requestMesage: requestMessage }, 'Request has no sender');
				} else {
					req.log.error({ requestMessage: requestMessage }, 'Unable to process request');
				}

				return res.redirect('/not-found');
			},
			function fail(err) {
				req.log.error({ err: err, params: req.params }, 'Unable to load request');
				return res.redirect('/not-found');
			});
	}
	else {
		return res.redirect('/not-found');
	}
}