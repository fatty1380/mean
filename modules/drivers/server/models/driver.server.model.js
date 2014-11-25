'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    constants = require('constants'),
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

    schedule: ['Schedule'],

    about: {
        type: String,
        default: '<p>Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.</p><p> Aenean lacinia bibendum nulla sed consectetur. Donec id elit non mi porta gravida at eget metus.</p>'
    },

    experience: [{
        title: {
            type: String
        },
        description: {
            type: String
        },
        time: {
            start: Date,
            end: Date
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

DriverSchema.pre('save', function(next){
  this.modified = Date.now;
  next();
});

/**
 * Hook a pre save method to create a base schedule (if necessary)
 */
DriverSchema.pre('save', ['Schedule', function(Schedule, next) {
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
}]);

mongoose.model('Driver', DriverSchema);
