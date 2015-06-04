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
        ref: 'User'
    },
    text: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'read', 'deleted', 'ignored'],
        default: 'draft'
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
});

RequestMessageSchema.statics.reqTypes = {
    friendRequest : 'friendRequest'
};

mongoose.model('Message', MessageSchema);
mongoose.model('RequestMessage', RequestMessageSchema);
