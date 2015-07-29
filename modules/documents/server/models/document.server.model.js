'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Document Schema
 */
var DocumentSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Document name',
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

mongoose.model('Document', DocumentSchema);