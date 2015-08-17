'use strict';

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

/**
 * Message Schema
 */
var MessageSchema = new Schema({
    sender: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Message must have a Sender'
    },
    recipient: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Please select a recipient'
    },
    text: {
        type: String,
        required: 'Please enter a message'
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'read', 'deleted', 'ignored'],
        default: 'sent'
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

var RequestMessageSchema = new Schema({
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['new', 'accepted', 'rejected'],
        default: 'new'
    },
    requestType: {
        type: String,
        enum: ['friendRequest'],
        default: 'friendRequest'
    },
    message: {
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

mongoose.model('Message', MessageSchema);
mongoose.model('RequestMessage', RequestMessageSchema);
