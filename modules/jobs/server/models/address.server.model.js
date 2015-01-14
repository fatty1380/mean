'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    constants = require('../../../../modules/core/server/models/outset.constants');

//var constants = require('core/server/models/outset.constants');

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
        enum: ['main', 'home', 'business', 'billing', 'other']
    },

    typeOther: {
        type: String,
        default: null,
        trim: true
    },

    streetAddresses: {
        type: [String],
        default: [''],
        trim: true
        //validate: [validateStreetAddressValue, 'Please provide a valid street address'],
    },

    city: {
        type: String,
        default: '',
        trim: true
    },

    state: {
        type: String,
        default: '',
        required: 'Please specify a State'
        //enum: constants.stateAbbreviations(),
    },

    zipCode: {
        type: String,
        default: '',
        match: [/\d{5}(\-\d{4})?/],
        trim: true
    }
});

AddressSchema.methods.checkConfig = function() {
    console.log('config enums: ' + constants.usStates);
};

mongoose.model('Address', AddressSchema);
