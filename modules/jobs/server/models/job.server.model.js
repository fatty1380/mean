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
            default: 0
        },
        max: {
            type: Number,
            default: 0
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
});


JobSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

mongoose.model('Job', JobSchema);
