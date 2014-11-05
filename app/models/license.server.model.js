'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A method to retrieve any enum values
 */
var getEnumValues = function() {
    var enums;
};

/**
 * License Schema
 */
var LicenseSchema = new Schema({
    // License model fields
    type: {
        type: String,
        enum: ['standard', 'commercial'],
        default: 'standard',
    },
    number: {
        type: String,
        trim: true,
        default: '',
    },
    dateOfBirth: {
        type: Date,
        default: '',
        trim: true,
    },
    state: {
        type: String,
        trim: true,
        default: 'AZ',
        validate: [validateLocalStrategyProperty, 'Please select your state'],
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
        default: [],
    },
    issued: {
        type: Date,
        default: null,
    },
    expires: {
        type: Date,
        default: null,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    modified: {
        type: Date,
        default: Date.now,
    }
});

LicenseSchema.pre('save', function(next){
  this.modified = Date.now;
  next();
});

mongoose.model('License', LicenseSchema);
