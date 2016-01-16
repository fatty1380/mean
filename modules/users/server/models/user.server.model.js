'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    path = require('path'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

var _ = require('lodash'),
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
        default: '' // modules/users/img/profile/default.png
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
    provider: {
        type: String,
        required: 'Provider is required'
    },
    providerData: {},
    additionalProvidersData: {},

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

    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },

    email: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your email']
        //match: [/^(.+@.+\..+)$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        trim: true,
        default: ''
        //match: [/(\+?\d{1,2}\s?-?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/]
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
    },
    
    /** Deprecated */
    oldPass: {
        type: Boolean,
        default: false
    }
}, { collection: 'users', discriminatorKey: '_type', 'toJSON': { virtuals: true } });


/**
 * Create a text index on the User Schema.
 * This index is used for $text queries (eg: users.profile.server.controller:search())
 * 
 * NOTE: If Adding a new field, the existing index must be removed prior to the new
 * index being created.
 */
UserSchema.index({
    firstName: 'text',
    lastName: 'text',
    username: 'text',
    email: 'text',
    handle: 'text'
});

// UserSchema.pre('init', function (next, data) {
//     if (!data.displayName) {
//         data.displayName = data.firstName + ' ' + data.lastName;
//     }
    
//     next();
// });

var fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller'));
UserSchema.pre('init', function (next, data) {

    log.trace({ props: data.props, avatar: data.props && data.props.avatar, pURL: data.profileImageURL }, 'Logging avatar');

    if (data.props && /^data:/.test(data.props.avatar)) {
        return saveImageToCloud(data.props.avatar, data, next);
    } else if (/^data:/.test(data.profileImageURL)) {
        return saveImageToCloud(data.profileImageURL, data, next);
    }

    next();
});
UserSchema.pre('save', function (next) {
    if (!!this.isModified('props') &&
        !!this.props.avatar &&
        this.props.avatar !== this.profileImageURL) {

        if (/^data:/.test(this.props.avatar)) {
            return saveImageToCloud(this.props.avatar, this, next)
                .then(function (result) {
                    log.info({ func: 'pre-save', profileImageURL: this.profileImageURL, avatar: this.props.avatar }, 'After Pre-Save');
                });
        }

        this.profileImageURL = this.props.avatar;
    }

    next();
});

function saveImageToCloud(image, document, next) {
    var post = {
        isSecure: false,
        content: document.props.avatar || document.profileImageURL
    };

    return fileUploader.saveContentToCloud(post)
        .then(
            function success(uploadResponse) {
                log.info({ func: 'pre-init', url: uploadResponse }, 'Uploaded Data to cloud');

                document.profileImageURL = document.props.avatar = uploadResponse.url;
                
                var update = { profileImageURL: uploadResponse.url, props: document.props };
                                
                var p;
                if (document._type === 'Driver') {
                    p = mongoose.model('Driver');
                } else {
                    p = mongoose.model('User');
                }

                p.findByIdAndUpdate(document._id, update, { new: true })
                    .exec().then(
                        function success(updatedUser) {
                            log.info({ func: 'pre-init:post-save', updatedPURL: updatedUser.profileImageURL, upAvatar: updatedUser.props && updatedUser.props.avatar }, 'Updated User to new URL');
                        })
                    .catch(function fail(omg) {
                        log.error({ func: 'pre-init:post-save', err: omg }, 'Updating user failed');
                        });

                log.info({ func: 'pre-init', updatedUser: document }, 'Updated User to new URL');
            })
        .catch(
            function fail(err) {
                log.error({ func: 'pre-init', err: err }, 'Failed to upload base64 data to cloud');

                next();
            })
        .finally(next);
}

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {

    if (this.isModified('firstName') || this.isModified('lastName')) {
        this.displayName = this.firstName + ' ' + this.lastName;
    }

    if (!this.isModified('password')) {
        return next();
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
    log.trace({ func: 'cleanse' }, 'Cleansing sensitive Data');

    delete this._doc.oldPass;
    delete this._doc.password;
    delete this._doc.salt;

    return this;
};

UserSchema.methods.socialify = function () {
    log.trace({ func: 'socialify' }, 'Cleansing semi-sensitive Data');

    this.provider = undefined;
    this.username = null;
    this.email = null;
    this.phone = null;

    this.cleanse();
};

UserSchema.methods.loadFriends = function () {
    return this.db.model('User')
        .find({ _id: { '$in': this.friends }, 'friends': this._id })
        .select(UserSchema.statics.fields.social);
};

UserSchema.statics.fields = {
    social: ['firstName', 'lastName', 'friends', 'profileImageURL', 'handle', 'displayName', 'created'].join(' ')
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
    var _this = this;
    var possibleUsername = (username + (suffix || '')).toLowerCase();

    var userNameRegex = new RegExp('^' + possibleUsername.toLowerCase() + '$', 'i');

    _this.findOne({
        username: { $regex: userNameRegex }
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

UserSchema.virtual('address')
    .get(function () {
        if (_.isEmpty(this.addresses)) {
            return null;
        }
        if (this.addresses.length === 1) {
            return this.addresses[0];
        }

        var addr = _.find(this.addresses, { type: 'main' });
        if (!_.isEmpty(addr)) {
            return addr;
        }

        addr = _.find(this.addresses, { type: 'home' });
        if (!_.isEmpty(addr)) {
            return addr;
        }

        return _.first(this.addresses);
    })
    .set(function (value) {
        if (_.isEmpty(this.addresses)) {
            this.addresses = [value];
        }
        else {
            var match = _.find(this.addresses, { type: value.type || 'main' });
            
            if (!_.isEmpty(match)) {
                _.extend(match, value);
            }
            else {
                this.addresses.push(value);
            }
        }
        this.markModified('addresses');
    });

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
var User = mongoose.model('User', UserSchema);
