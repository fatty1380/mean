'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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
}, { toJSON: { virtuals: true } });

ChatSchema.pre('save', function () {
    if (!this.recipientName && !!this.recipient && this.isModified('recipient')) {
        this.recipientName = this.recipient.displayName;
    }
});

mongoose.model('Chat', ChatSchema);