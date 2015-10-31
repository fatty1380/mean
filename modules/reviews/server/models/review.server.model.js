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
	
	/**
	 * User
	 * @description The User who has been reviewed
	 */
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: true
	},
	
	request: {
		type: Schema.ObjectId,
		ref: 'RequestMessage',
		default: null
	},
	
	/**
	 * Reviewer (optional)
	 * @description The User who wrote the review
	 */
	reviewer: {
		type: Schema.ObjectId,
		ref: 'User',
	},
	
	/**
	 * Name
	 * @description The Name of who wrote the review
	 */
	name: {
		type: String,
		default: '',
		trim: true
	},
	
	/**
	 * Email
	 * @description The Email of who wrote the review
	 */
	email: {
		type: String,
		default: '',
		trim: true
	},
	
	/**
	 * Phone
	 * @description The Phone Number of who wrote the review
	 */
	phone: {
		type: String,
		default: '',
		trim: true
	},
	
	/**
	 * Title
	 * @description The Title of the review
	 */
	title: {
		type: String,
		default: '',
		required: 'Please fill in a short review title',
		trim: true
	},
	
	/**
	 * Text
	 * @description The Text/Body of the review
	 */
	text: {
		type: String,
		default: null,
		trim: true
	},
	
	/**
	 * Rating
	 * @description Rating on a scale of 1 to 5
	 */
	rating: {
		type: Number,
		min: 1,
		max: 5,
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

ReviewSchema.pre('validate', function (next) {
	if (!this.email && !!this.reviewer) {
		this.email = this.reviewer.email;
	}
	if (!this.name && !!this.reviewer) {
		this.name = this.reviewer.shortName;
	}

	next();
});

mongoose.model('Review', ReviewSchema);