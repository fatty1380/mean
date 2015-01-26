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
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    used: {
        type: Number,
        required: true
    },
    available: {
        type: Number,
        required: true
    },
    renews: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'pending'],
        default: 'active'
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

