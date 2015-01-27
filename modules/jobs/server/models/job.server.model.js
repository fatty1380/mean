'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Address      = mongoose.model('Address'),
Company      = mongoose.model('Company'),
Schema       = mongoose.Schema;

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

    location: ['Address'],

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

JobSchema.virtual('payString').get(function () {
    var retval = '';

    if (!!this.payRate.min) {
        retval = '$' + this.payRate.min;
    }
    if (!!this.payRate.max) {
        retval += (!!retval ? ' to $' : '$') + this.payRate.max;
    }
    if (!!retval && !!this.payRate.period) {
        retval += ' per ' + this.payRate.period;
    }

    return retval;
});

mongoose.model('Job', JobSchema);
