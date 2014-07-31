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
 * A method to retrieve any enum values
 */
 var getEnumValues = function() {
 	//Temp.schema.path('salutation').enumValues;

 	debugger;
 	var enums;
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
	},
	state: {
		type: String,
		trim: true,
		default: 'AZ',
		validate: [validateLocalStrategyProperty, 'Please select your state'],
	},
	endorsements: {
		type: [String],
		enum: ['none', 'Class A', 'Class C', 'Motorcycle'],
		default: [],
	},
	issued: {
		type: Date,
		default: null,
	},
	expires: {
		type: Date,
		default: null,
	},
	updated: {
		type: Date,
		default: Date.now,
	},
	created: {
		type: Date,
		default: Date.now,
	}
});

mongoose.model('License', LicenseSchema);