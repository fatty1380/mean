'use strict';

/**
 * Module dependencies.
 */
var validator = require('validator'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var validateZipCode = function(value) {
    console.log('Validator length check: ', validator.len(value, 5, 10));
    console.log('Validator regex check: ', validator.matches(value, /^[0-9]+[ -]{0,1}[0-9]+$/));
    console.log('alt validator regex check: ', validator.matches(value, /^\d{5}(?:[-\s]\d{4})?$/));

    return (validator.len(value, 5, 10) && validator.matches(value, /^[0-9]+[ -]{0,1}[0-9]+$/));
};

/**
 * Company Schema
 */
var CompanySchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill in your Company\'s name',
        trim: true
    },

    zip: {
        type: String,
        default: '',
        match: [/^\d{5}$/, 'Please provide a valid ZIP code for the location of your business']

    },

    about: {
        type: String,
        default: '',
        required: 'Please provide some information about your business',
    },

    phone: {
        type: String,
        trim: true,
        default: '',
        match: [/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/],
    },

    email: {
        type: String,
        trim: true,
        default: '',
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },

    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Company', CompanySchema);
