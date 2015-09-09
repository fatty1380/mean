'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
_            = require('lodash'),
path         = require('path'),
addrFile     = require(path.resolve('./modules/jobs/server/models/address.server.model')),
subFile     = require(path.resolve('./modules/messages/server/models/subscription.server.model')),
Address      = mongoose.model('Address'),
Subscription = mongoose.model('Subscription'),
Schema       = mongoose.Schema,
Gateway      = mongoose.model('Gateway'),
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
        match: [/^(\d{5}|)$/, 'Please provide a valid ZIP code for the location of your business']
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
        sku: {
            type: String,
            default: null // 'OUTSET_MVR'
        },
        required: {
            type: Boolean,
            default: false
        },
        payment: {
            type: String,
            enum: ['applicant', 'company', 'mixed', ''],
            default: 'applicant' //'company'
        },
        releaseType: {
            type: String,
            default: null//'preEmployment'
        }
    },
    
    /**
     * "Social" and Feed additions
     */

    followers: {
        type: [{
            type: Schema.ObjectId,
            ref: 'User'
        }],
        default: []
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

CompanySchema.pre('init', function (next, data) {
    if (_.isEmpty(data.subscription)) {
        data.subscription = new Subscription();
    }

    next();
});

CompanySchema.pre('save', function (next) {
    _.defaults(this.gateway, {type: null, required: false, payment: null, releaseType: null});
    next();
});

CompanySchema.pre('save', function (next) {
    if (this.isModified()) {
        this.modified = Date.now();
    }
    next();
});

CompanySchema.pre('validate', function (next) {
    log.trace('pre.validate', 'START', {Addresses: this.locations});

    this.locations = Address.map(this.locations);

    log.trace('pre.validate', 'End Result location(s)', {Addresses: this.locations});

    next();
});

mongoose.model('Company', CompanySchema);
