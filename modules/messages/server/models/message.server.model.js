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
        //enum: ['new', 'accepted', 'rejected'],
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

var ChatSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Please define a user'
    },
    recipientName: {
        type: String,
        required: 'Please select a recipient'
    },
    recipient: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    profileImageURL: {
        type: String,
        default: null
    },
    lastMessage: {
        type: Schema.Types.Mixed,
        default: null
    },
    messages: {
        type: ['Message'],
        default: []
    }
}, { toJSON: { virtuals: true } })

ChatSchema.pre('save', function () {
    if (!this.recipientName && !!this.recipient && this.isModified('recipient')) {
        this.recipientName = this.recipient.displayName;
    }
})

mongoose.model('Chat', ChatSchema);

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
    inviteContactInfo: {
        type: Schema.Types.Mixed
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

mongoose.model('Message', MessageSchema);
mongoose.model('RequestMessage', RequestMessageSchema);