'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
crypto = require('crypto');

var ReportApplicantSchema = new Schema({

    /** Core information from eVerifile Servers --------------------------*/

    remoteId: {
        type: Number,
        required: true
    },

    govId: {
        type: String,
        default: '',
        trim: true,
        match: [/^\d{9}$/g, 'Please enter a valid Government ID']
    },

    salt: {
        type: String
    },

    reports: [{
        type: Schema.ObjectId,
        ref: 'BackgroundReport'
    }],

    /** Outset Specific Values ------------------------------------------*/

    /** To be used for mapping local values to remote schema
     * For Example: 'user.firstName' maps to 'firstName'
     * If there is no local mapping defined, we will not attempt autofill
     */
    localMapping: String,

    /** Boolean flag to indicate that certain data is sensitive
     * For Example: SSN will need to be handled carefully
     */
    isSensitive: Boolean,


    /** Bookkeeping Information ------------------------------------------*/

    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

ReportApplicantSchema.pre('save', function (next) {
    this.modified = Date.now;
    next();
});


/**
 * Hook a pre save method to hash the password
 */
ReportApplicantSchema.pre('save', function(next) {
    this.govId = this.govId && this.govId.replace(/\D/g,''); // Replace non-numeric values

    if (this.govId && this.govId.length === 9) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.govId = this.getHashedValue(this.govId);
    }

    next();
});

/**
 * Create instance method for hashing a govId
 */
ReportApplicantSchema.methods.getHashedValue = function(govId) {
    if (this.salt && govId) {
        return crypto.pbkdf2Sync(govId, this.salt, 10000, 64).toString('base64');
    } else {
        return govId;
    }
};

/**
 * Create instance method for authenticating user
 */
ReportApplicantSchema.methods.authenticate = function(govId) {
    return this.govId === this.getHashedValue(govId);
};

mongoose.model('ReportApplicant', ReportApplicantSchema);
