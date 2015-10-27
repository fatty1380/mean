'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
var shortid = require('shortid');
    
/**
 * Workflow for sending an invite request to a non-outset user:
 * 
 * 1. User fills out at least a valid phone or email address
 * 2. Optionally adds first/last, display names, other phone, email addresses
 * 3. Data is posted to server, request is saved with the following:
 *     - Sender's ID (from)
 *     - Contact info from 1 and 2 (contactInfo)
 *     - Current status (new) ... [Do we need a 'sent' status]
 *     - Whether this is a friend request or a share request (requestType)
 *     - Message body text (text)
 *     - Request Contents (contents) - In the case of shareRequests, used to indicate what documents are to be shared
 *     - id/_id for tying things together
 * 4. Depending on the available contact info, the server will send an email or SMS message
 * 5. The message will contain a link, including the requestMessage's id
 * 6. The recipient clicks the link, and is brought into the app.
 * 7. The recipient must signup and add a password to activate the account.
 * 8. The RequestMessage is updated with a valid UserID in the 'to' field.
 * 
 * Other Points:
 * Once signed up, the server should search for existing Requests and rectify them per step #8
 * The same will be true if the user signs up for Outset without a link.
 */

// TODO: Combine with "Message" schema
// var sampleContactInfo =
// {
//     emails: [{ work: 'pat@work.com', isPreferred: true }],
//     phone: [{ mobile: '123-456-7675', isPreferred: true }],
//     firstName: 'Pat',
//     lastName: 'Smith',
//     displayName: 'Pat Smith'
// }
var RequestMessageSchema = new Schema({
    shortId: {
        type: String,
        unique: true,
        'default': shortid.generate
    },
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.ObjectId,
        ref: 'User',
        default: null
    },
    contactInfo: {
        type: Schema.Types.Mixed
    },
    contents: {
        type: Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['new', 'sent', 'bounced', 'accepted', 'rejected'],
        default: 'new'
    },
    requestType: {
        type: String,
        enum: ['friendRequest', 'shareRequest', 'reviewRequest', 'reportRequest'],
        default: 'friendRequest'
    },
    text: {
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
}, {toJSON: {virtuals: true}});

RequestMessageSchema.statics.reqTypes = {
    friendRequest : 'friendRequest'
};

mongoose.model('RequestMessage', RequestMessageSchema);