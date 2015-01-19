'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Connection Schema
 */
var ConnectionSchema = new Schema({
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    validFrom: {
        type: Date,
        default: Date.now
    },

    validForDays: {
        type: Number,
        default: 30
    },

    validTo: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: ['closed', 'revoked', 'limited', 'full'],
        default: 'full'
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

ConnectionSchema.pre('save', function(next) {
    debugger;
    if(!this.validTo && !!this.validForDays) {
        this.validTo = this.validFrom || new Date();
        console.log('Adding %d days to start date %s', this.validForDays, this.validTo);
        this.validTo.setDate(this.validTo.getDate() + this.validForDays);
        console.log('Connection valid until: %s', this.validTo);
    }

    next();
});

mongoose.model('Connection', ConnectionSchema);
