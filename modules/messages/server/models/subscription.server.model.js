'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Subscription Schema
 */
var SubscriptionSchema = new Schema({
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

mongoose.model('Subscription', SubscriptionSchema);

