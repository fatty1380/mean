'use strict';

/**
 * Module dependencies.
 */
var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema;

/**
 * Schedule Schema
 */
var ScheduleSchema = new Schema( {
    // Schedule model fields
    time: {
        type: String,
        default: '',
    },
    day: {
        type: [ Boolean ],
        default: [ false, false, false, false, false, false, false ]
    }
} );

mongoose.model( 'Schedule', ScheduleSchema );
