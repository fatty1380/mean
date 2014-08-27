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
 * endorsements	[{ Mixed }]
 * connections	[Connection]
 * experience	"text
 * time
 * location"
 * schedule		[Schedule]
 * isActive
 * isDeleted
 * created
 * moditifed
 */
var DriverSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Driver name',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },


    addresses: ['Address'],

    licenses: ['License'],

    endorsements: Schema.Types.Mixed,

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
});

mongoose.model('Driver', DriverSchema);
