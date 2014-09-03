'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Address = mongoose.model('Address'),
    Schema = mongoose.Schema;

/**
 * Job Schema
 */
var JobSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill in a title for this Job',
        trim: true
    },
    description: {
        type: String,
        default: '',
        required: 'Please fill in a Job description',
        trim: true,
    },

    location: {
        type: Schema.ObjectId,
        ref: 'Address',
    },

    payRate: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 0,
        },
    },

    applications: [{
        type: Schema.ObjectId,
        ref: 'Application',
    }],

    // TODO - Determine if this is the appropriate place for driver/applicant status
    driverStatus: {
        type: String,
        default: 'unreviewed',
        enum: ['unreviewed', 'connected', 'hired', 'ignored'],
    },

    postStatus: {
        type: String,
        default: '',
        enum: ['draft', 'posted', 'withdrawn', 'deleted']
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
    posted: {
        // TODO: figure out null dates
        type: Date,
        default: Date.now,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    }
});

mongoose.model('Job', JobSchema);
