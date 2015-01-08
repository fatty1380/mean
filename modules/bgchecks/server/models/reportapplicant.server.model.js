'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
crypto       = require('crypto');

var ReportApplicantSchema = new Schema({

    /** Core information from eVerifile Servers --------------------------*/

    remoteId: {
        type: Number,
        required: true
    },

    remoteSystem: {
        type: String,
        default: 'everifile'
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },

    governmentId: {
        type: String,
        default: '',
        trim: true
    },

    salt: {
        type: String
    },

    reports: [{
        type: Schema.ObjectId,
        ref: 'BackgroundReport'
    }],

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

ReportApplicantSchema.post('init', function(next) {
    if (typeof(next) === 'function') { debugger; next(); } else { console.log('UnknownNext: %j', next);}
}) ;
ReportApplicantSchema.post('save', function(next) {
    if (typeof(next) === 'function') { debugger; next(); } else { console.log('UnknownNext: %j', next);}
}) ;
ReportApplicantSchema.post('validate', function(next) {
    if (typeof(next) === 'function') { debugger; next(); } else { console.log('UnknownNext: %j', next);}
}) ;
ReportApplicantSchema.post('remove', function(next) {
    if (typeof(next) === 'function') { debugger; next(); } else { console.log('UnknownNext: %j', next);}
}) ;
ReportApplicantSchema.pre('validate', function(next) {
    if (typeof(next) === 'function') { debugger; next(); } else { console.log('UnknownNext: %j', next);}
}) ;
ReportApplicantSchema.pre('remove', function(next) {
    if (typeof(next) === 'function') { debugger; next(); } else { console.log('UnknownNext: %j', next);}
}) ;
ReportApplicantSchema.pre('save', function (next) {

    if (typeof(next) === 'function') { debugger; // TODO - A: Why is this saving, B: Is sensitive data removed

    next(); } else { console.log('UnknownNext: %j', next);}
});
ReportApplicantSchema.pre('init', function (next) {

    if (this.hasOwnProperty('applicantId')) {
        this.remoteId = this.applicantId;
    }

    this.governmentId = this.governmentId && this.governmentId.replace(/\D/g, ''); // Replace non-numeric values

    if (this.governmentId && this.governmentId.length === 9) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.governmentId = this.getHashedValue(this.governmentId);
    } else {
        console.log('Invalid Government ID for Applicant - setting to null', this.remoteId);
        this.governmentId = null;
    }


    next();
});

/**
 * Create instance method for hashing a SSN or other sensitive data
 */
ReportApplicantSchema.methods.getHashedValue = function (govId) {
    if (this.salt && govId) {
        return crypto.pbkdf2Sync(govId, this.salt, 10000, 64).toString('base64');
    } else {
        return govId;
    }
};

/**
 * Create instance method for authenticating user
 */
ReportApplicantSchema.methods.validateId = function (govId) {
    return this.governmentId === this.getHashedValue(govId);
};

mongoose.model('ReportApplicant', ReportApplicantSchema);
