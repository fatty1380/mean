'use strict';

/**
 * Module dependencies.
 */
var _    = require('lodash'),
mongoose = require('mongoose'),
Schema   = mongoose.Schema;

/**
 * BackgroundReport Schema
 */
var BackgroundReportSchema = new Schema({

    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },

    remoteId: {
        type: Number,
        default: -1
    },

    remoteApplicantId: {
        type: Number,
        required: true
    },

    localReportSku: {
        type: String,
        default: '',
        required: true
    },

    remoteReportSkus: {
        type: String,
        default: '',
        required: false
    },

    /** According to 'Report Status Codes' in the eVERIFILE API Document
     * Submitted - has been received by the reporting engine and being processed
     * Invoked - 3rd party vendor has been called and accepted the request
     * Errored - an error occurred during the process, but is potentially recoverable (will retry)
     * Responded - 3rd party vendor has called back with data for the report
     * Suspended - No longer being worked by 3rd party data provider. Likely due to needing more information.
     * Validated - report data has passed validation and ready to send to 3rd party data provider
     * Queued - client application has successfully sent the report request, but is queued for processing by the report engine.
     * Failed - an error occurred during processing, but is not recoverable so is at end state
     * Need info - data vendor requires more information for processing report
     * Completed - data vendor indicated that the report is finished
     * Rejected - data for applicant info did not pass validation against report field schema (i.e. missing required fields)
     */

    /**
     * This contains an array of the results of each ReportCheckStatus API Call
     */
    statuses: [{
        sku: String,
        value: {
            type: String,
            enum: ['SUBMITTED', 'INVOKED', 'ERRORED', 'RESPONDED', 'SUSPENDED', 'VALIDATED', 'REJECTED', 'QUEUED', 'FAILED', 'NEED_INFO', 'COMPLETED']
        },
        requiredData: [{
            type: String
        }],
        completed: Boolean
    }],

    /**
     * In Progress: "active"
     *      Paid, Submitted, Invoked, Responded, Validated, Queued
     * Error States: "error"
     *      Errored, Suspended, Failed, Need Info, Rejected
     * Complete: "complete"
     *      Completed
     */

    status: {
        type: String,
        enum: ['UNKNOWN', 'PAID', 'SUBMITTED', 'INVOKED', 'ERRORED', 'RESPONDED', 'SUSPENDED', 'VALIDATED', 'REJECTED', 'QUEUED', 'FAILED', 'NEED_INFO', 'COMPLETED'],
        default: 'UNKNOWN'
    },

    isComplete: {
        type: Boolean,
        default: false
    },

    data: {
        xml: String,
        raw: Schema.Types.Mixed
    },

    paymentInfo: {
        type: Schema.Types.Mixed,
        default: null
    },

    created: {
        type: Date,
        default: Date.now
    },

    modified: {
        type: Date,
        default: Date.now
    },

    completed: {
        type: Date,
        default: null
    }
}, {toJSON: {virtuals: true}});

BackgroundReportSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

BackgroundReportSchema.pre('save', function (next) {
    this.updateStatus();
    next();
});

BackgroundReportSchema.virtual('isActive')
    .get(function () {
        return ['PAID', 'SUBMITTED', 'INVOKED', 'RESPONDED', 'VALIDATED', 'QUEUED'].indexOf(this.status) !== -1;
    });

BackgroundReportSchema.virtual('isErrored')
    .get(function () {
        //Errored, Suspended, Failed, Need Info, Rejected
        return ['ERRORED', 'SUSPENDED', 'FAILED', 'NEED_INFO', 'REJECTED'].indexOf(this.status) !== -1;
    });

BackgroundReportSchema.virtual('isSuccess')
    .get(function () {
        return 'COMPLETED' === this.status;
    });

BackgroundReportSchema.virtual('isPaid')
    .get(function () {
        return this.paymentInfo && this.paymentInfo.success;
    });

BackgroundReportSchema.virtual('latestStatuses')
    .get(function () {

        var statuses = this.statuses;
        var skus = this.remoteReportSkus && this.remoteReportSkus.split(',');
        var retval = {};

        var latest = _.each(skus, function(sku) {
            var stati = _.findLast(statuses, {sku: sku});

            console.log('[BGSchema.latestStatuses] %s --> %s', sku, stati && stati.value);
            retval[sku] = stati || null;
        });

        return retval;
    });


var statusOrder = ['PAID', 'SUBMITTED', 'INVOKED', 'ERRORED', 'RESPONDED', 'VALIDATED', 'QUEUED', 'SUSPENDED', 'REJECTED', 'FAILED', 'NEED_INFO'];

BackgroundReportSchema.methods.updateStatus = function () {
    var status = this.status;
    var index = statusOrder.indexOf(status);
    var allComplete = true;

    _.each(this.latestStatuses, function(stat) {
        if(allComplete && (!stat || stat.value !== 'COMPLETED')) {
            allComplete = false;
        }

        var i = statusOrder.indexOf(stat);
        if(i > index) {
            index = i;
            status = stat.value;
        }
    });

    if(allComplete) {
        this.status = 'COMPLETED';
    } else {
        this.status = status;
    }
};

mongoose.model('BackgroundReport', BackgroundReportSchema);
