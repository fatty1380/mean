'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Address Schema
 */
var AddressSchema = new Schema({
    type: {
        type: String,
        default: 'main',
        enum: ['main', 'home', 'business', 'billing', 'other'],
    },
    streetAddresses: [{
        type: String,
        default: [''],
        trim: true,
    }],

    city: {
        type: String,
        default: '',
        trim: true,
    },

    state: {
        type: String,
        default: '',
        //enum : config.assets.USAStates,
    },

    zipCode: {
        type: String,
        default: '',
        match: [/\d{5,5}/],
        trim: true,
    },
});

mongoose.model('Address', AddressSchema);
