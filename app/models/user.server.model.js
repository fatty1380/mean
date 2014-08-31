'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    License = mongoose.model('License'),
    Address = mongoose.model('Address'),
    Schedule = mongoose.model('Schedule'),
    config = require('../../config/env/all');

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
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },

    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },
    types: [{
        type: String,
        enum: ['driver', 'owner', ''],
    }],
    email: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your email'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    phone: {
        type: String,
        trim: true,
        match: [/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/], // TODO: Fix this Regex
        // TODO: Look at https://github.com/albeebe/phoneformat.js or https://github.com/Bluefieldscom/intl-tel-input for phone # formatting
    },
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16)
            .toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    if (this.types === undefined) {
        this.types = [];

        if (this.type !== undefined) {
            this.types.push(this.type);
        }
    }

    if (this.schedule === undefined) {
        this.schedule = [];
    }
    if (this.schedule.length === 0) {
        this.schedule.push(new Schedule({
            time: 'morning'
        }));
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64)
            .toString('base64');
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
