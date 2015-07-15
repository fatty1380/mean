'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('lodash'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users',
        file: 'users.server.model'
    });

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function (password) {
    return (this.provider !== 'local' || (password && password.length >= 8));
};

var SeedSchema = new Schema({
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
    email: {
        type: String,
        unique: 'Username already exists',
        required: 'Please fill in your email address',
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    
    zip: {
        type: String,
        trim: true,
        default: ''
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    modified: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    }

});


SeedSchema.pre('save', function (next) {
    if (!!this.isModified()) {
        this.modified = Date.now();
    }
    next();
});

mongoose.model('SeedUser', SeedSchema);

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
    
    profileImageURL: {
        type: String,
        default: 'modules/users/img/profile/default.png'
    },
    
    handle: {
        type: String,
        trim: true,
        default: null
    },
    
    // Sensitive and/or Auth Related Info //
    password: {
        type: String,
        default: '',
        validate: [validateLocalStrategyPassword, 'Password must be at least 8 characters']
    },
    salt: {
        type: String
    },
    oldPass: {
        type: Boolean,
        default: false
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

    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    
    modified: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
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
        match: [/(\+?\d{1,2}\s?-?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/]
        // TODO: Look at https://github.com/albeebe/phoneformat.js or https://github.com/Bluefieldscom/intl-tel-input for phone # formatting
    },

    company: {
        type: Schema.ObjectId,
        ref: 'Company',
        default: null
    },

    /**
     * Addresses holds one or more Address Objects, nested
     * locally within the User model
     */
    addresses: ['Address'],

    /**
     * Friends & Connections : START
     */

    friends: {
        type: [{
            type: Schema.ObjectId,
            ref: 'User'
        }],
        default: []
    },
    
    requests: {
        type: [{
            type: Schema.ObjectId,
            ref: 'RequestMessage'
        }],
        default: []
    },
    
    //conversations: [{}],

    /** Friends & Connections : END **/
    
    /**
     * User Profile Data and Information
     */
     

    /** Section Begin : Virtual Members **/

    displayName: {
        type: String,
        trim: true
    }
}, {collection: 'users', discriminatorKey : '_type', 'toJSON': {virtuals: true}});



UserSchema.index({
    firstName: 'text',
    lastName: 'text',
    username: 'text',
    email: 'text'
});

// UserSchema.pre('init', function (next, data) {
//     if (!data.displayName) {
//         data.displayName = data.firstName + ' ' + data.lastName;
//     }
    
//     next();
// });

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    if (this.isModified('firstName') || this.isModified('lastName')) {
        this.displayName = this.firstName + ' ' + this.lastName;
    }

    if (this.password && this.password.length > 6) {
        this.salt = crypto.randomBytes(16).toString('base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

UserSchema.pre('validate', function (next) {
    this.username = this.username || this.email;

    next();
});

UserSchema.pre('save', function (next) {
    if (/[A-Z]/.test(this.username)) {
        this.username = this.username.toLowerCase();
        this.email = this.email.toLowerCase();
    }
    next();
});

UserSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
    } else {
        return password;
    }
};

UserSchema.methods.oldHash = function (password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};


/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
    if (this.password === this.hashPassword(password)) {
        return true;
    }
    if (this.password === this.oldHash(password)) {
        this.oldPass = true;
        return true;
    }
    return false;
};

UserSchema.methods.cleanse = function () {
    console.log('[UserSchema] Cleansing sensitive Data');

    this.oldPass = undefined;
    this.password = undefined;
    this.salt = undefined;
};

UserSchema.methods.socialify = function () {
    console.log('[UserSchema] Cleansing semi-sensitive Data');
    
    this.provider = undefined;
    this.username = null;
    this.email = null;
    this.phone = null;
    
    this.cleanse();
}

UserSchema.methods.loadFriends = function() {
    return this.db.model('User')
        .find({_id: {'$in': this.friends}, 'friends': this._id})
        .select(UserSchema.statics.fields.social);
};

UserSchema.statics.fields = {
    social: ['firstName','lastName','username','friends','profileImageURL','company'].join(' ')
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
    var _this = this;
    var possibleUsername = (username + (suffix || '')).toLowerCase();

    var userNameRegex = new RegExp('^' + possibleUsername.toLowerCase() + '$', 'i');

    _this.findOne({
        username: {$regex: userNameRegex}
    }, function (err, user) {
        if (!err) {
            if (!user) {
                callback(possibleUsername);
            } else if (possibleUsername.indexOf('@') === -1) {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
            callback(null);
        } else {
            callback(null);
        }
    });
};

UserSchema.virtual('shortName')
    .get(function () {
        return (!!this.firstName ? this.firstName : null) + (!!this.lastName ? this.lastName.substring(0, 1) : null);
    });

UserSchema.virtual('isAdmin')
    .get(function () {
        return !!this.roles && this.roles.indexOf('admin') !== -1;
    });


UserSchema.virtual('isDriver')
    .get(function () {
        return /driver/i.test(this._type);
    });


UserSchema.virtual('isOwner')
    .get(function () {
        return !!this.company;
    });

log.debug({ func: 'register' }, 'Registering `User` with mongoose');
mongoose.model('User', UserSchema);
