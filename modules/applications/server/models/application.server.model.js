'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema;

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
     * hired        The employer has chosen to hire the applicant for this job
     * deleted      The applicant has decided to delete their application
     * rejected     The employer has chosen not to persue the applicant for employment
     */
    status: {
        type: String,
        enum: ['draft', 'submitted', 'read', 'connected', 'hired', 'deleted', 'rejected'],
        default: 'draft'
    },


    /**
     * Mesages
     * -------
     * This represents the communications between the applicant and company
     */
    introduction: {
        type: String,
        required: true
    },

    messages: [{
        type: Schema.ObjectId,
        ref: 'Message'
    }],

    connection: {
        type: Schema.ObjectId,
        ref: 'Connection'
    },

    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }

    /* Virtual Members - END */
}, {'toJSON': {virtuals: true}});


ApplicationSchema.virtual('isDraft')
    .get(function () {
        return this.status === 'draft';
    });

ApplicationSchema.virtual('isNew')
    .get(function () {
        return this.status === 'submitted';
    });

ApplicationSchema.virtual('isReviewed')
    .get(function () {
        return this.status === 'read';
    });

ApplicationSchema.virtual('isConnected')
    .get(function () {
        return this.status === 'connected';
    });

ApplicationSchema.virtual('isRejected')
    .get(function () {
        return this.status === 'rejected';
    });

ApplicationSchema.virtual('isDeleted')
    .get(function () {
        return this.status === 'deleted';
    });

ApplicationSchema.virtual('isHired')
    .get(function () {
        return this.status === 'hired';
    });

ApplicationSchema.virtual('statusCat')
.get(function() {
        switch(this.status) {
        case 'draft':
        case 'submitted': return 'new';
        case 'read': return 'reviewed';
        case 'connected':
            if(this.connection && this.connection.isExpired) {
                return 'expired';
            }
            return 'connected';
        case 'rejected': return 'rejected';
        case 'deleted': return 'deleted';
        case 'hired': return 'hired';
        }
    });

ApplicationSchema.virtual('statusIndex')
    .get(function() {
        switch(this.status) {
            case 'draft': return 0;
            case 'submitted': return 1;
            case 'read': return 2;
            case 'connected': return 3;
            case 'rejected': return 4;
            case 'deleted': return 5;
            case 'hired': return 6;
        }
    });



ApplicationSchema.virtual('canMessage')
    .get(function () {
        return this.isHired || this.isConnected;
    });

ApplicationSchema.virtual('canViewDocs')
    .get(function () {
        return this.isHired || this.isRejected || this.isConnected;
    });


ApplicationSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

ApplicationSchema.pre('save', function (next) {

    if (/draft|submitted|read/.test(this.status)) {
        if (!!this.connection) {
            this.status = 'connected';
        }
    }

    next();
});

mongoose.model('Application', ApplicationSchema);
