'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

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

mongoose.model('Message', MessageSchema);