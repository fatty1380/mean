'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Bgcheck Schema
 */
var BgcheckSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Bgcheck name',
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

mongoose.model('Bgcheck', BgcheckSchema);