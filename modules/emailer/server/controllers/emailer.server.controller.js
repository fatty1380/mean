'use strict';

/* jshint camelcase:false */
/* TODO: Camelcase is deprectated - migrate to jscs */

exports.sendMessage = sendMessage;
exports.sendTemplate = sendTemplate;
exports.sendTemplateBySlug = sendGenericTemplateEmail;

var _              = require('lodash'),
    path           = require('path'),
    config         = require(path.resolve('./config/config')),
    mandrill       = require('mandrill-api/mandrill'),
    mandrillClient = !!config.services.mandrill.apiKey ? new mandrill.Mandrill(config.services.mandrill.apiKey) : null,
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'notifications',
        file: 'emailer'
    });

var recipientOverrideAddress = config.mailer.toOverride;

function getMessage(options) {

    var message = {
        'merge_language': 'mailchimp',
        'google_analytics_domains': [
            'joinoutset.com',
            'truckerline.com'
        ],
        'metadata': {
            'website': 'www.truckerline.com'
        }
    };

    if (!!recipientOverrideAddress) {
        log.debug('Override of Recipient Email Address. Sending to: %s', recipientOverrideAddress);

        var i;
        for (i = 0; i < options.to.length; i++) {
            options.to[i].email = recipientOverrideAddress;
            options.to[i].name = options.to[i].name + ' [OVERRIDE]';
        }

        log.debug('Override set for %d recipients', i);
    }

    return _.extend(message, options);
}

function sendGenericTemplateEmail(templateName, user, options) {

    if(!user) {
        log.error({ func: 'sendGenericTemplateEmail' }, 'No user specified - returning');
        return { message: 'No User Specified', e: new Error('No User') };
    }

    log.debug({ func: 'sendGenericTemplateEmail' }, 'Sending email template: %s', templateName);

    var mailOptions = {
        to: [{
            email: user.email,
            name: user.displayName || user.handle || user.email
        }],
        inline_css: true,

        global_merge_vars: [
            {
                name: 'USERNAME',
                content: user.firstName || user.displayName
            },
            {
                name: 'FNAME',
                content: user.firstName || user.displayName
            }
        ]
    };

    if (!!options && !_.isEmpty(options)) {
        if (_.isArray(options)) {
            log.debug({ func: 'sendGenericTemplateEmail' }, 'merging options array');
            mailOptions.global_merge_vars = _.union(mailOptions.global_merge_vars, options);
        }
        else if (_.isObject(options)) {
            log.debug({ func: 'sendGenericTemplateEmail', keys: _.keys(options) }, 'merging options object');
            _.forOwn(options, function (key, value) {
                mailOptions.global_merge_vars.push({ name: key, content: value });
             });
        }
    }

    log.debug({ func: 'sendGenericTemplateEmail', options: mailOptions.global_merge_vars }, 'options result post merge');

    var e = sendTemplate(templateName, mailOptions);

    if (!e) {
        return {
            message: 'An email has been sent to ' + user.email
        };
    }

    else {
        return { message: 'Results', e: e };
    }

}

function sendTemplate(templateName, mailOptions) {

    if(!mandrillClient) {
        log.debug('Mandril API Not Configured');
        return false;
    }

    var message = getMessage(mailOptions);
    var async = false;
    var ipPool = 'Main Pool';

    log.debug('Full Message Object: %j', message);

    return mandrillClient.messages.sendTemplate({
        'template_name': templateName,
        'template_content': {},
        'message': message,
        'async': async,
        'ip_pool': ipPool
    }, function (result) {
        log.debug('Emailer] Successful Result: %j', result);
        return;
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        log.debug('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        return e;
    });
}

function sendMessage(mailOptions) {
    if(!mandrillClient) {
        log.debug('Mandril API Not Configured');
        return false;
    }

    var message = getMessage(mailOptions);
    var async = false;
    var ipPool = 'Main Pool';

    log.debug('Full Message Object: %j', message);

    mandrillClient.messages.send({
        'message': message,
        'async': async,
        'ip_pool': ipPool
    }, function (result) {
        log.debug('Emailer] Successful Result: %j', result);
        return;
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        log.debug('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        return e;
    });
}
