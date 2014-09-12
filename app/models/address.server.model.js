'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var constants = require('../../config/env/constants');

/**
 * A Validation function for street addresss
 */
var validateStreetAddressValue = function(streetAddresses) {
    return (streetAddresses && streetAddresses.length > 0) && (streetAddresses[0].length > 3);
};

/**
 * Address Schema
 */
var AddressSchema = new Schema({
    type: {
        type: String,
        default: 'main',
        required: 'Please specify an address type',
        enum: ['main', 'home', 'business', 'billing', 'other'],
    },
    streetAddresses: {
        type: [String],
        default: [''],
        trim: true,
        validate: [validateStreetAddressValue, 'Please provide a valid street address'],
    },

    city: {
        type: String,
        default: '',
        trim: true,
    },

    state: {
        type: String,
        default: '',
        required: 'Please specify a State',
        enum: constants.state_abbreviations(),
    },

    zipCode: {
        type: String,
        default: '',
        match: [/\d{5,5}/],
        trim: true,
    },
});

AddressSchema.methods.checkConfig = function() {
    console.log('config enums: ' + constants.us_states);

    console.log('config abbreviations: ' + constants.state_abbreviations());
};

mongoose.model('Address', AddressSchema);
