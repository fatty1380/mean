'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Review Schema
 */
var ReviewSchema = new Schema({
	
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: true
	},
	reviewer: {
		type: Schema.ObjectId,
		ref: 'User',
	},
	
	name: {
		type: String,
		default: '',
		trim: true
	},
	email: {
		type: String,
		default: '',
		trim: true,
		required: 'Please provide your email address'
	},
	title: {
		type: String,
		default: '',
		required: 'Please fill in a short review title',
		trim: true
	},
	body: {
		type: String,
		default: null,
		trim: true
	},
	rating: {
		type: Number,
		required: 'Please select a rating'
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

mongoose.model('Review', ReviewSchema);