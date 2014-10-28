'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    job: {
        type: Schema.ObjectId,
        ref: 'Job'
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'read', 'connected', 'deleted', 'rejected'],
        default: 'draft'
    },
    messages: [{
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
            default: 'draft',
        },
        created: {
            type: Date,
            default: Date.now
        },
        modified: {
            type: Date,
            default: Date.now
        },
    }],


    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },

    /* Virtual Members - BEGIN */

    isDraft: {
        type: Boolean
    },
    isReviewed: {
        type: Boolean
    },
    isDeleted: {
        type: Boolean
    },
    isConnected: {
        type: Boolean
    },
    isRejected: {
        type: Boolean
    },

    /* Virtual Members - END */
});

mongoose.model('Application', ApplicationSchema);
