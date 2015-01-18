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

    agents: [{
        type: Schema.ObjectId,
        ref: 'User'
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

    locations: ['Address'],

    about: {
        type: String,
        default: ''
    },

    phone: {
        type: String,
        trim: true,
        default: '',
        match: [/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/]
    },

    email: {
        type: String,
        trim: true,
        default: '',
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },

    profileImageURL: {
        type: String,
        default: ''
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

CompanySchema.pre('save', function(next){
  this.modified = Date.now;
  next();
});

mongoose.model('Company', CompanySchema);
