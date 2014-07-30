'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * License Schema
 */
var LicenseSchema = new Schema({
	// License model fields   
	type: {
		type: String,
		enum: ['Standard', 'Commercial'],
		default: 'Standard',
	},
	number: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	state: {
		type: String,
		trim: true,
		default: 'AZ',
		validate: [validateLocalStrategyProperty, 'Please select your state'],
	},
	endorsements: {
		type: [{
			type: String,
			enum: ['none', 'Class A', 'Class C', 'Motorcycle']
		}],
		default: ['none']
	},
	issued: {
		type: Date
	},
	expires: {
		type: Date
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('License', LicenseSchema);