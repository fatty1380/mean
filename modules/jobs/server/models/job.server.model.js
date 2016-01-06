'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
_            = require('lodash'),
Q            = require('q'),
Address      = mongoose.model('Address'),
Company      = mongoose.model('Company'),
Schema       = mongoose.Schema,
path         = require('path'),
log          = require(path.resolve('./config/lib/logger')).child({
    module: 'jobs',
    file: 'Jobs.Model'
});

/**
 * Job Schema
 */
var JobSchema = new Schema({

    /**
     * The User who posted the job
     */
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    /**
     * The company who is hiring for the job
     */
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },

    name: {
        type: String,
        default: '',
        required: 'Please fill in a Job Headline',
        trim: true
    },
    description: {
        type: String,
        default: '',
        required: 'Please fill in a Job Description',
        trim: true
    },

    requirements: {
        type: String,
        trim: true,
        default: ''
    },

    // TODO: Migrate to single embedded (?)
    location: {
        type: ['Address']
    },

    payRate: {
        min: {
            type: Number,
            default: null
        },
        max: {
            type: Number,
            default: null
        },
        period: {
            type: String,
            default: null
        }
    },

    // TODO: Determine if used
    views: [{
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],

    applications: [{
        type: Schema.ObjectId,
        ref: 'Application'
    }],

    categories: {
        type: [{
            key: String,
            value: Boolean
        }],
        default: []
    },

    externalApplicationLink: {
        type: String,
        default: null
    },

    postStatus: {
        type: String,
        default: 'draft',
        enum: ['draft', 'posted', 'withdrawn', 'deleted']
    },

    isDeleted: {
        type: Boolean,
        default: false
    },
    posted: {
        type: Date
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


JobSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

JobSchema.pre('validate', function (next) {
    log.trace('pre.validate', 'START', {Addresses: this.location});

    this.location = Address.map(this.location);

    log.trace('pre.validate', 'End Result location(s)', {Addresses: this.location});

    next();
});

// This migrates non-AddressSchema documents into Addresses
// TODO: Determine why we need to assign to _this._doc, not data
JobSchema.pre('init', function (next, data) {
    var _this = this;

    _this._doc.location = Address.map(data.location);

    next();
});

JobSchema.virtual('payString').get(function () {
    log.trace('virtual.payString', 'GET', {payRate: this.payRate});

    var retval = '';

    if (!!this.payRate) {
        if (!!this.payRate.min) {
            retval = '$' + this.payRate.min;
        }
        if (!!this.payRate.max) {
            retval += (!!retval ? ' to $' : '$') + this.payRate.max;
        }
        if (!!retval && !!this.payRate.period) {
            retval += ' per ' + this.payRate.period;
        }
    }

    return retval;
});

mongoose.model('Job', JobSchema);
