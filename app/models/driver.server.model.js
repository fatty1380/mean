'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Address = mongoose.model('Address');

/**
 * Driver Schema
 * user			User
 * address		[Address]
 * licenses		[License]
 * endorsements	[{ ? }]
 * connections	[Connection]
 * experience	"text
 * time
 * location"
 * schedule		[Schedule]
 * isActive
 * isDeleted
 * created
 * modified
 */
var DriverSchema = new Schema({

    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },


    addresses: [{
        type: Schema.ObjectId,
        ref: 'Address'
    }],

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

mongoose.model('Driver', DriverSchema);
