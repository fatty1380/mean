'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * A Validation function for street addresss
 */
var minLengthValidator = function(description) {
    return description && description.length > 1;
};

/**
 * Schedule Schema
 */
var ScheduleSchema = new Schema({
    // Schedule model fields
    time: {
        start: {
            type: Number,
            default: 0,
            min: 0,
            max: 23,
        },
        end: {
            type: Number,
            default: 1,
            min: 0,
            max: 23,
        }
    },
    description: {
        type: String,
        default: '',
        validate: [minLengthValidator, 'Please set the description of this schedule']
    },
    days: {
        type: [Boolean],
        default: [false, false, false, false, false, false, false]
    }
});

mongoose.model('Schedule', ScheduleSchema);
