'use strict';

// Load Schedule early //
var preload = require('./schedule');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Schedule = mongoose.model('Schedule'),
    Address = mongoose.model('Address'),
    constants = require('../../config/env/constants'),
    _ = require('lodash');

/**
 * Driver Schema
 * user         User
 * address      [Address]
 * licenses     [License]
 * endorsements [{ ? }]
 * connections  [Connection]
 * experience   "text
 * time
 * location"
 * schedule     [Schedule]
 * isActive
 * isDeleted
 * created
 * modified
 */
var DriverSchema = new Schema({

    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    },

    licenses: ['License'],

    endorsements: [{
        description: String,
        expires: Date,
    }],

    schedule: {
        type: ['Schedule'],
    },

    experience: [{
        text: {
            type: String
        },
        time: {
            type: String
        },
        location: {
            type: String
        },
    }],

    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },

    created: {
        type: Date,
        default: Date.now,
    },

    modified: {
        type: Date,
        default: Date.now,
    },
});


/**
 * Hook a pre save method to create a base schedule (if necessary)
 */
DriverSchema.pre('save', function(next) {
    if (_.isUndefined(this.schedule)) {
        this.schedule = [];
    }

    var _self = this;

    if (this.schedule.length === 0) {
        _.forEach(constants.base_schedule, function(val, key) {
            _self.schedule.push(new Schedule(val));
        });
    }

    next();
});

mongoose.model('Driver', DriverSchema);
