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

var messageTemplate = '{{SENDER_NAME}} has invited you to join TruckerLine. Join the Convoy at www.joinoutset.com';
var noSenderTemplate = 'You have been invited to join Truckerline. Join the convoy at www.joinoutset.com';

var templates = {};

/**
 * getMessage
 * ----------
 * given Options, creates a message object prepared for sending.
 */
function sendMessageRequest(message, messageConfig) {

    var sender = !!messageConfig.from && messageConfig.from.firstName || null;

    var body = noSenderTemplate;
    var vars = messageConfig.vars || [];

    if (!!sender) {
        body = (message || messageConfig.template || messageTemplate);

        var bodyVars = body.match(/{{\s*[\w\.]+\s*}}/g)
            .map(function (x) { return x.match(/[\w\.]+/)[0]; });


        _.each(bodyVars, function (bv) {
            var replacement = vars[bv] || '';

            body.replace('{{' + bv + '}}', replacement);
        });
    } else {
        log.warn({ func: 'sendMessageRequest', err: 'No Sender Specified', config: messageConfig }, 'Must specify a sender when sending a message request');
    }

    var messageObj = {
        to: _.isArray(messageConfig.to) ? _.first(messageConfig.to) : messageConfig.to,
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

    log.info({ func: 'sendMessageRequest', message: message }, 'Sending Message');

    return client.sendMessage(messageObj).then(
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
