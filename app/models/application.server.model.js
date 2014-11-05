'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * (Job) Application Schema
 */
var ApplicationSchema = new Schema({
    /**
     * User
     * ----
     * The user account who created this application.
     * "I am the person filling out the application to get a job"
     */
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    /**
     * Job
     * ----
     * The the job that this application is for.
     * "This is the job that the _User_ is applying to"
     */
    job: {
        type: Schema.ObjectId,
        ref: 'Job'
    },

    /**
     * Company
     * -------
     * The company that posted the job, primarily here for convenience
     */
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },

    /**
     * Status
     * ----
     * The current state of the application
     * "What is the state of my job application?"
     * -----
     * draft        The application has been written but not sent to the employer
     * submitted    The applicaiton has been sent to the employer
     * read         The application has been seen/read by the employer
     * connected    The employer has chosen to make a connection to talk further
     * delisted     The job post will no longer appear in search, and new applications will not be accepted.
     * hired        The employer has chosen to hire the applicant for this job
     * deleted      The applicant has decided to delete their application
     * rejected     The employer has chosen not to persue the applicant for employment
     */
    status: {
        type: String,
        enum: ['draft', 'submitted', 'read', 'connected', 'delisted', 'hired', 'deleted', 'rejected'],
        default: 'draft'
    },

    /**
     * Mesages
     * -------
     * This represents the communications between the applicant and company
     */
    messages: ['Message'],


    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    },

    /* Virtual Members - BEGIN */
    isDraft: {
        type: Boolean
    },
    isReviewed: {
        type: Boolean
    },
    isDeleted: {
        type: Boolean
    },
    isConnected: {
        type: Boolean
    },
    isRejected: {
        type: Boolean
    },

    /* Virtual Members - END */
});

ApplicationSchema.pre('save', function(next){
  this.modified = Date.now;
  next();
});

mongoose.model('Application', ApplicationSchema);
