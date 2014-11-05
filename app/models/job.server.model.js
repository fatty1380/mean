'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Address = mongoose.model('Address'),
    Company = mongoose.model('Company'),
    Schema = mongoose.Schema;

/**
 * Job Schema
 */
var JobSchema = new Schema({

    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },

    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },

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

    // TODO - Determine if this is the appropriate place for driver/applicant status
    driverStatus: {
        type: String,
        default: 'unreviewed',
        enum: ['unreviewed', 'connected', 'hired', 'ignored'],
    },

    postStatus: {
        type: String,
        default: 'draft',
        enum: ['draft', 'posted', 'withdrawn', 'deleted']
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
    posted: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now,
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

JobSchema.pre('save', function(next){
  this.modified = Date.now;
  next();
});

mongoose.model('Job', JobSchema);
