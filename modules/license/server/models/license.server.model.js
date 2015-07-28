'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
path         = require('path'),
config       = require(path.resolve('./modules/core/server/controllers/config.server.controller'));

/**
 * A Validation function for local strategy properties
 */
var validateState = function (property) {

    if (!property) {
        return true;
    }

    return config.validate('states', property);
};


var DateString = {
    value: {
        type: String,
        default: ''
    },
    parseFormat: {
        type: String,
        default: 'YYYYMMDD'
    }
};

/**
 * License Schema
 */
var LicenseSchema = new Schema({
    // License model fields
    type: {
        type: String,
        enum: ['standard', 'commercial'],
        default: 'standard'
    },
    number: {
        type: String,
        trim: true,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: '',
        trim: true
    },
    state: {
        type: Schema.Types.Mixed,
        trim: true,
        default: null,
        validate: [validateState, 'Please select a state from the available options']
    },
    rating: {
        type: String,
        default: 'D'
    },
    endorsements: {
        type: [{
            key: String,
            value: Boolean
        }],
        default: []
    },
    issued: DateString,
    expires: {
        type: Date,
        default: null
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

LicenseSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

mongoose.model('License', LicenseSchema);
