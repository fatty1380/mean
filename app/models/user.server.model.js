'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	License = mongoose.model('License'),
	config = require('../../config/env/all')
	;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		unique: true,
		required: 'Please fill in a username',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},

	// Additional Fields
	phone: {
		type: String,
		trim: true,
		match: [/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/], // TODO: Fix this Regex
		// TODO: Look at https://github.com/albeebe/phoneformat.js or https://github.com/Bluefieldscom/intl-tel-input for phone # formatting
	},

	// Mailing Address -- START
	streetAddress : { 
		type : String,
		default: '',
		trim : true,
	},

	streetAddress2 : {
	 	type : String,
		default: '',
		trim : true,
	},

	city : {
		type : String,
		default: '',
		trim : true,
	},
	
	state : { 
		type : String,
		default: '', 
		//enum : config.assets.USAStates,
	},
	
	zipCode : { 
		type : String,
		default: '', 
		match : [/\d{5,5}/],
		trim : true,
	},

	// Mailing Address -- END

	dateOfBirth : {
		type : Date,
		default : '',
		trim : true,
	},

	// "Driver" Specific Information
	// TODO: Move to Sub-Class of User

	// Complex Modeling taken from http://stackoverflow.com/questions/8737082/mongoose-schema-within-schema
	licenses: [{
		type: Schema.ObjectId, 
		ref: 'License',
		default : [new License({ type : '', number : '', state : '', issued : new Date('2014-07-01'), expired : new Date('2014-07-01')})],
	}],

	experience: [{
		text : { type : String },
		time : { type : String },
		location : { type : String },
	}]
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('User', UserSchema);