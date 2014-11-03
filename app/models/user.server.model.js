'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

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
    username: {
        type: String,
        unique: 'Username already exists',
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

    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },

    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },
    type: {
        type: String,
        enum: ['driver', 'owner'],
        default: ''
    },
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
        default: '',
        match: [/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/],
        // TODO: Look at https://github.com/albeebe/phoneformat.js or https://github.com/Bluefieldscom/intl-tel-input for phone # formatting
    },

    /**
     * Addresses holds one or more Address Objects, nested
     * locally within the User model
     */
    addresses: ['Address'],

    /** Section Begin : Virtual Members **/

    displayName: {
        type: String,
        trim: true
    },

    //    driver: {
    //        type: Schema.Types.Mixed
    //    },

    //company: {
    //    type: Schema.ObjectId,
    //    ref: 'User'
    //},
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

    next();
});


UserSchema.methods.migrate = function() {

    var changed = false;

    if (!this.type) {
        debugger;

        var types = this.getValue('types');

        if (!!types && types.length) {
            // Move the "Types" data into "type"
            console.log('Migrating user.types --> user.type: ', types);
            this.type = types[0];
            this.setValue('types', undefined);
            changed = true;
        }
    }

    if (this.types && this.type) {
        console.log('Removing value for user.types');
        this.types = undefined;
        changed = true;
    }

    if (this.getValue('types')) {
        console.log('Removing value for user[types]');
        this.setValue('types', undefined);
        changed = true;
    }

    if (changed) {
        this.save(function(err) {
            if (err) {
                console.err('Unable to save migrated user: %o', err);
            }
            else {
                console.log('Saved migrated user: %o', this);
            }
        });
    }

    return changed;
};

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
