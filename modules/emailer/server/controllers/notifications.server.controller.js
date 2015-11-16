'use strict';

var _ = require('lodash'),
	path = require('path'),
    mongoose = require('mongoose'),
	Q = require('q'),
	EventEmitter = require('events').EventEmitter,
	eventServer = new EventEmitter(),
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

exports.send = send;
exports.processRequest = processRequest;
exports.events = eventServer;
	
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

	eventServer.on('user:new', function (user, req) {
		send('user:new', { user: user });
	});

	log.debug({ func: 'initialize' }, 'Initialization complete');
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


/**
 * processInboundRequest
 * ---------------------
 * Method called primarily from teh 'requests.server.controller' (for now), to isolate code used
 * when handling an inbound friend request.
 * 
 * This method will always result in a "redirect" response to the client.
 */

function processInboundRequest(req, res) {

	var requestMessage = req.request;
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var redirect = 'http://www.truckerline.com';

	if (_.isEmpty(requestMessage)) {
		return res.redirect(redirect);
	}

	switch (requestMessage.requestType) {
		case 'friendRequest':
			(new Login({ input: requestMessage.shortId, result: 'referral', userId: requestMessage.user, ip: ip })).save().finally(_.noop());

			if (!!requestMessage.objectLink) {
				req.log.debug({ func: 'loadRequest', link: requestMessage.objectLink }, 'Forwarding Request to link');
				return res.redirect(requestMessage.objectLink);
			} else {
				return getBranchDeepLink(requestMessage, requestMessage.requestType)
					.then(function (resultUrl) {
						if (!_.isEmpty(resultUrl)) {
							req.log.info({ func: 'loadRequest', branchURL: resultUrl }, 'Redirecting to branch URL');
							redirect = resultUrl;
						}
					})
					.catch(function (err) {
						req.log.error({ func: 'loadRequest', err: err }, 'Unable to generate new Branch Redirect URL');
					})
					.finally(function () {
						return res.redirect(redirect);
					});

			}
	}
	
	return res.redirect(redirect);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function processNewRequest(event, requestMessage, sender) {
	var result, recipient, emails, phoneNumbers;

	var config = eventConfig[event];

	if (_.isEmpty(config)) {
		return Q.reject('Invalid Event Configuration');
	}

	log.debug({ func: 'processNewRequest', requestMessage: requestMessage, config: config }, 'START');

	if (_.isObject(requestMessage.to) && _.has(requestMessage.to, 'email')) {
		log.debug({ func: 'processNewRequest', recipient: requestMessage.to }, 'Resolving Recipient from Object');
		recipient = Q.when(requestMessage.to);
	} else if (!_.isEmpty(requestMessage.to)) {
		log.debug({ func: 'processNewRequest', recipient: requestMessage.to }, 'Resolving Recipient from String');
		recipient = User.findById(requestMessage.to).select('firstName lastName displayName phone email').exec();
	} else {
		log.debug({ func: 'processNewRequest', recipient: requestMessage.contactInfo }, 'Resolving Recipient from ContactInfo');
		emails = requestMessage.contactInfo.emails;
		phoneNumbers = requestMessage.contactInfo.phoneNumbers;

		recipient = Q.when(requestMessage.contactInfo);
	}

	//log.debug({ func: 'processNewRequest', sender: sender, from_ID: requestMessage.from._id.toString(), stringQ: _.isString(requestMessage.from), fromId: requestMessage.from.id, from_id: requestMessage.from._id }, 'Evaluating sender');

	if (_.isEmpty(sender)) {
		sender = User.findById(requestMessage.from._id || requestMessage.from).select('firstName lastName displayName phone email').exec();
	}

	return Q.all([recipient, Q.when(sender)])
		.then(function (results) {
			// Handle sending...
			var target = results[0];
			var sender = results[1];

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
				return getBranchDeepLink(requestMessage, event, result.method)
					.then(function (deepLinkURL) {
						return deepLinkURL;
					})
					.catch(function (err) {
						log.error({ func: 'processNewRequest', err: err }, 'Failed to load Branch Metrics request');
						return null;
					});
			}
		})
		.then(function (objectLink) {

			if (result.success && requestMessage.status === 'new') {
				log.debug('Setting `new` status to `sent` after success');
				requestMessage.status = 'sent';
				requestMessage.objectLink = objectLink;

				return requestMessage.save();
			}

			return requestMessage;
		})
		.then(function (saveResult) {
			result.requestMessage = saveResult.toObject();

			return result;
		});
}

/**
 * 
 */
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

//////////////////////////////////////////////////////
//				Branch Metrics Code					//
//////////////////////////////////////////////////////

var unirest = require('unirest'),
	path = require('path'),
	config = require(path.resolve('./config/config'));

var branchConfig = config.services.branch;

function getBranchDeepLink(request, event, channel) {

	debugger;
	var senderId = _.isString(request.from) ? request.from : request.from.toHexString();
	debugger;

	var postData = {
		branch_key: branchConfig.key,
		data: {
			requestId: request.id,
			requestUserId: senderId,
			shortId: request.shortId
		},
		feature: event,
		channel: channel
	};

	var deferred = Q.defer();

	unirest.post(branchConfig.url + '/v1/url')
		.type('json')
		.send(postData)
		.end(function (response) {
			if (response.error) {
				log.error({ func: 'getBranchDeepLink', err: response.body, code: response.code, response: response }, 'Branch Link Failed');
				return deferred.reject(response.body);
			}

			log.info({ func: 'getBranchDeepLink', response: response.body }, 'Got Branch URL');

			return deferred.resolve(response.body.url);
		});

	return deferred.promise;
}

//////////////////////////////////////////////////////
