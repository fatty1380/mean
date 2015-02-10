'use strict';

exports.sendMessage = sendMessage;
exports.sendTemplate = sendTemplate;
exports.sendTemplateBySlug = sendGenericTemplateEmail;

var _              = require('lodash'),
    path           = require('path'),
    config         = require(path.resolve('./config/config')),
    mandrill       = require('mandrill-api/mandrill'),
    mandrillClient = new mandrill.Mandrill('5151B5l4NJ2YVYQANFTKpA'); // TODO: Move to CONFIG

function getMessage(options) {

    var message = {
        'merge_language': 'mailchimp',
        'google_analytics_domains': [
            'joinoutset.com'
        ],
        'metadata': {
            'website': 'www.joinoutset.com'
        }
    };

    if (!!recipientOverrideAddress) {
        console.log('Override of Recipient Email Address. Sending to: %s', recipientOverrideAddress);

        var i;
        for (i = 0; i < options.to.length; i++) {
            options.to[i].email = recipientOverrideAddress;
            options.to[i].name = options.to[i].name + ' [OVERRIDE]';
        }

        console.log('Override set for %d recipients', i);
    }

    return _.extend(message, options);
}

var recipientOverrideAddress = config.mailer.toOverride;

function sendGenericTemplateEmail(templateName, user, options) {

    console.log('Sending email template: %s', templateName);

    var mailOptions = {
        to: [{
            email: user.email,
            name: user.displayName
        }],
        inline_css: true,

        global_merge_vars: [
            {
                name: 'USERNAME',
                content: user.firstName || user.displayName
            }
        ]
    };

    if(!!options && !!options.length) {
        debugger;
        mailOptions.global_merge_vars = _.union(mailOptions.global_merge_vars, options);
    }

    console.log('With options: %j', mailOptions);

    var e = sendTemplate(templateName, mailOptions);

    if (!e) {
        return {
            message: 'An email has been sent to ' + user.email + ' with further instructions.'
        };
    }

    else {
        return e;
    }

}

function sendTemplate(templateName, mailOptions) {

    var message = getMessage(mailOptions);
    var async = false;
    var ipPool = 'Main Pool';

    console.log('Full Message Object: %j', message);

    mandrillClient.messages.sendTemplate({
        'template_name': templateName,
        'template_content': {},
        'message': message,
        'async': async,
        'ip_pool': ipPool
    }, function (result) {
        console.log('Emailer] Successful Result: %j', result);
        return;
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        return e;
    });
}

function sendMessage(mailOptions) {

    var message = getMessage(mailOptions);
    var async = false;
    var ipPool = 'Main Pool';

    console.log('Full Message Object: %j', message);

    mandrillClient.messages.send({
        'message': message,
        'async': async,
        'ip_pool': ipPool
    }, function (result) {
        console.log('Emailer] Successful Result: %j', result);
        return;
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        return e;
    });
}
