'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Company Schema
 */
var CompanySchema = new Schema({

    owner: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    users: [{
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            default: '',
            enum: ['owner', 'agent', 'driver']
        }
    }],

    name: {
        type: String,
        default: '',
        required: 'Please fill in your Company\'s name',
        trim: true
    },

    zipCode: {
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
    }
});

mongoose.model('Company', CompanySchema);
