'use strict';

exports.sendMessage = sendMessage;
exports.sendTemplate = sendTemplate;

var _ = require('lodash'),
    Q = require('q'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    twilio = require('twilio'),
    doT = require('dot'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'notifications',
        file: 'messenger'
    });

var clientConfig = config.services.twilio || {};
var client = twilio(clientConfig.accountSid, clientConfig.authToken);

var recipientOverrideAddress = config.services.twilio.toOverride;

var defaultMessageTemplate = '{{=it.SENDER_NAME}} has invited you to join TruckerLine. Join the Convoy at http://truckerline.com';
var noSenderTemplate = 'You have been invited to join Truckerline. Join the convoy at http://truckerline.com';

var templates = {};

/**
 * getMessage
 * ----------
 * given Options, creates a message object prepared for sending.
 */
function sendMessageRequest(message, messageConfig) {

    log.info({ func: 'sendMessageRequest', message: message, messageConfig: messageConfig }, 'Sending Message (START)');

    if (_.isObject(message) && _.isEmpty(messageConfig)) {
        messageConfig = message;
        message = 'Build your Driving Career at Truckerline.com';
    }

    var sender = !!messageConfig.from && (messageConfig.from.firstName || messageConfig.from.displayName)
        || messageConfig.vars && messageConfig.vars.SENDER_NAME
        || null;

    var body = noSenderTemplate;
    var vars = messageConfig.vars || [];
    var tempFn;
        log.info({ vars: vars }, 'Composing message with vars');
    
    if (!!sender) {
        tempFn = doT.template(message || messageConfig.template || defaultMessageTemplate);
        body = tempFn(vars);
    } else {
        log.warn({ func: 'sendMessageRequest', err: 'No Sender Specified', config: messageConfig }, 'Must specify a sender when sending a message request');
        tempFn = doT.template(noSenderTemplate);
        
        body = tempFn(vars);

    }
    
    var recipient = _.isString(messageConfig.to) && messageConfig.to
        || messageConfig.vars && messageConfig.vars.PHONE
        || null;

    var messageObj = {
        to: recipient,
        from: clientConfig.twilioNumber,
        body: body
    };

    if (!!recipientOverrideAddress) {
        log.debug('Override of Recipient Email Address. Sending to: %s', recipientOverrideAddress);

        if (_.isArray(messageObj.to)) {
            var len = messageConfig.to.length;
            for (var i = 0; i < len; i++) {
                messageConfig.to[i] = recipientOverrideAddress;
            }
            log.debug('Override set for %d recipients', i);
        } else {
            messageObj.to = recipientOverrideAddress;
        }
    }

    log.info({ func: 'sendMessageRequest', message: messageObj }, 'Sending Message');

    return client.sendMessage(messageObj).then(
        function success(responseData) {
            log.debug('Message success! Call SID: ' + responseData.sid);
            return responseData;
        }, function reject(error) {
            console.error('Call failed!  Reason: ' + error.message);
            return Q.reject(error);
        });
}

function sendTemplate(templateName, messageConfig) {

    if (!client) {
        log.debug('Twilio API Not Configured');
        return false;
    }

    if (!!templates[templateName]) {

        return sendMessageRequest(templates[templateName], messageConfig);
    }

    return false;
}

function sendMessage(message, messageConfig) {
    if (!client) {
        log.debug('Twilio API Not Configured');
        return false;
    }

    return sendMessageRequest(message, messageConfig);
}
