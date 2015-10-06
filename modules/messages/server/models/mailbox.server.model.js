'use strict';

/**
 * IMPORTANT: THIS CODE IS NOT CURRENTLY USED AND MAY BE DEPRECATED IN THE FUTURE
 * The idea of this code is to have a pre-set central mailbox for each user so that
 * extra queries to the database are not necessary. This funcitoniaty is currenlty
 * handled within the "Chat" object/schema and queries on the 'Requests' table.
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
/**
 * Mailbox & Notifications
 * --------------------------
 * @description Each user has a mailbox entry in the database. This is used to
 * store and manage messages (chat), notifications, requests, etc.
 */
 
var MailboxSchema = new Schema({
    
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Mailboxes must be associated with a user',
		unique: true
    },
    
    // TODO : Determine if reference or embedded is better
	messages: {
		type: [{type: Schema.ObjectId, ref: 'Message'}],
		default: []
    },
    
    requests: {
        type: ['RequestMessage']
    },
	
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	}
}, { toJSON: { virtuals: true } });

MailboxSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.modified = Date.now();
    }
	
	if(this.isNew) {
		this._id = this.user._id;
	}
	
    next();
});

mongoose.model('Mailbox', MailboxSchema);