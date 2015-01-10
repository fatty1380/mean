'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
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
        required: true
    },

    licenses: ['License'],

    schedule: ['Schedule'],

    about: {
        type: String,
        default: ''
    },

    experience: [{
        title: {
            type: String
        },
        description: {
            type: String
        },
        time: {
            start: { type: Date, default: null },
            end: { type: Date, default: null }
        },
        location: {
            type: String
        }
    }],

    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
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

DriverSchema.pre('save', function(next) {
    debugger;
    this.modified = Date.now();

    next();
});

mongoose.model('Driver', DriverSchema);
