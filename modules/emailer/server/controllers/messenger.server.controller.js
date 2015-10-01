'use strict';

exports.sendMessage = sendMessage;
exports.sendTemplate = sendTemplate;

var _ = require('lodash'),
    Q = require('q'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    twilio = require('twilio'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'notifications',
        file: 'messenger'
    });

var clientConfig = config.services.twilio || {};
var client = twilio(clientConfig.accountSid, clientConfig.authToken);

var recipientOverrideAddress = config.services.twilio.toOverride;

var messageTemplate = '${username} has invited you to join TruckerLine. Join the Convoy at www.joinoutset.com';
var noSenderTemplate = 'You have been invited to join Truckerline. Join the convoy at www.joinoutset.com';

/**
 * getMessage
 * ----------
 * given Options, creates a message object prepared for sending.
 */
function sendMessageRequest(messageConfig) {
    
    var sender = !!messageConfig.from && messageConfig.from.firstName || null;
    
    var body = noSenderTemplate;
    
    if (!!sender) {
        body = (messageConfig.message || messageConfig.template || messageTemplate);
        body = body.replace('${username}', sender);
    } else {
        log.warn({ func: 'sendMessageRequest', err: 'No Sender Specified', config: messageConfig }, 'Must specify a sender when sending a message request');
    }

    var message = {
        to: _.isArray(messageConfig.to) ? _.first(messageConfig.to) : messageConfig.to,
        from: clientConfig.twilioNumber,
        body: body
    };

    if (!!recipientOverrideAddress) {
        log.debug('Override of Recipient Email Address. Sending to: %s', recipientOverrideAddress);

        if (_.isArray(message.to)) {
            var len = messageConfig.to.length;
            for (var i = 0; i < len; i++) {
                messageConfig.to[i] = recipientOverrideAddress;
            }
            log.debug('Override set for %d recipients', i);
        } else {
            message.to = recipientOverrideAddress;
        }
    }
    
    log.info({ func: 'sendMessageRequest', message: message }, 'Sending Message');

    return client.sendMessage(message).then(
        function success(responseData) {
            log.debug('Call success! Call SID: ' + responseData.sid);
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
    
    return sendMessageRequest(messageConfig);
}

function sendMessage(messageConfig) {
    if (!client) {
        log.debug('Twilio API Not Configured');
        return false;
    }

    return sendMessageRequest(messageConfig);
}
