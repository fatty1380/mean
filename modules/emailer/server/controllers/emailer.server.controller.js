'use strict';

exports.sendMessage = sendMessage;
exports.sendTemplate = sendTemplate;
exports.sendTemplateBySlug = sendGenericTemplateEmail;

var _ = require('lodash');

var mandrill = require('mandrill-api/mandrill');
var mandrillClient = new mandrill.Mandrill('5151B5l4NJ2YVYQANFTKpA'); // TODO: Move to CONFIG

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

    return _.extend(message, options);
}

function sendGenericTemplateEmail(templateName, user, emailOverride) {

    console.log('Sending email template: %s', templateName);

    var mailOptions = {
        to: [{
            email: emailOverride || user.email,
            name: user.displayName + (!!emailOverride ? ' [OVERRIDE]' : '')
        }],
        inline_css: true,

        global_merge_vars: [
            {
                name: 'USERNAME',
                content: user.firstName
            }
        ]
    };

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
