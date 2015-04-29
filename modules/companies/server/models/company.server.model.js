'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
_            = require('lodash'),
path         = require('path'),
addrFile     = require(path.resolve('./modules/jobs/server/models/address.server.model')),
Address      = mongoose.model('Address'),
Schema       = mongoose.Schema,
Gateway =  mongoose.model('Gateway'),
log          = require(path.resolve('./config/lib/logger')).child({
    module: 'companies',
    file: 'Company.Model'
});

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

    legalEntityName: {
        type: String,
        default: null,
        trim: true
    },

    zipCode: {
        type: String,
        default: '',
        match: [/^\d{5}$/, 'Please provide a valid ZIP code for the location of your business']
    },

    locations: ['Address'],

    subscription: {
        type: Schema.ObjectId,
        ref: 'Subscription',
        default: null
    },

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
        default: 'modules/companies/img/profile/default.png'
    },

    gateway: {
        type: Schema.ObjectId,
        ref: 'Gateway',
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
}, {toJSON: {virtuals: true}});

CompanySchema.pre('validate', function (next) {
    debugger;

    next();
});

CompanySchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

CompanySchema.pre('validate', function (next) {
    log.trace('pre.validate', 'START', {Addresses: this.locations});

    this.locations = Address.map(this.locations);

    log.trace('pre.validate', 'End Result location(s)', {Addresses: this.locations});

    next();
});

mongoose.model('Company', CompanySchema);
