'use strict';

exports.sendMessage = sendMessage;

var mandrill = require('mandrill-api/mandrill');
var mandrillClient = new mandrill.Mandrill('5151B5l4NJ2YVYQANFTKpA'); // TODO: Move to CONFIG

function getMessage(options) {

    console.log('options: %j', options);

    var message = {
        'html': options.html,
        'text': 'Example text content',
        'subject': options.subject,
        'from_email': 'info@joinoutset.com',
        'from_name': 'Outset',
        'to': [{
            'email': options.to.email,
            'name': options.to.name,
            'type': 'to'
        }],
        'headers': {
            'Reply-To': 'info@joinoutset.com'
        },
        'important': false,
        'track_opens': null,
        'track_clicks': null,
        'auto_text': null,
        'auto_html': null,
        'inline_css': null,
        'url_strip_qs': null,
        'preserve_recipients': null,
        'view_content_link': null,
        'bcc_address': null,
        'tracking_domain': null,
        'signing_domain': null,
        'return_path_domain': null,
        'merge': false,
        'merge_language': 'mailchimp',
        'tags': [
            'password-resets'
        ],
        'google_analytics_domains': [
            'joinoutset.com'
        ],
        'metadata': {
            'website': 'www.joinoutset.com'
        }
    };

    return message;
}

function sendMessage(mailOptions)
{

    var message = getMessage(mailOptions);
    var async = false;
    var ipPool = 'Main Pool';

    console.log('Full Message Object: %j', message);

    mandrillClient.messages.send({
        'message': message,
        'async': async,
        'ip_pool': ipPool
    }, function (result) {
        console.log(result);
        /*
         [{
         'email': 'recipient.email@example.com',
         'status': 'sent',
         'reject_reason': 'hard-bounce',
         '_id': 'abc123abc123abc123abc123abc123'
         }]
         */
        return;
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
        return e;
    });
}
