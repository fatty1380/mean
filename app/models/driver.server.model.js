'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Driver Schema
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
	}
});

mongoose.model('Driver', DriverSchema);