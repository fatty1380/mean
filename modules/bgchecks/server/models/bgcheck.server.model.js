'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * BackgroundReport Schema
 */
var BackgroundReportSchema = new Schema({

    remoteId: {
        type: Number,
        required: true
    },

    type: {
        type: String,
        ref: 'ReportType'
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
    status: {
        type: String,
        enum: ['SUBMITTED', 'INVOKED', 'ERRORED', 'RESPONDED', 'SUSPENDED', 'VALIDATED', 'REJECTED', 'QUEUED', 'FAILED', 'NEED_INFO', 'COMPLETED']
    },

    data: {
        isComplete: Boolean,

        xml: String,
        raw: Schema.Types.Mixed
    },

    /**
     * This contains an array of the results of each ReportCheckStatus API Call
     */
    updateStatusChecks: [{
        type: Schema.Types.Mixed
    }],

    nextUpdateCheck: {
        type: Date,
        required: false
    },

    created: {
        type: Date,
        default: Date.now
    },

    modified: {
        type: Date,
        default: Date.now
    }
});

BackgroundReportSchema.pre('save', function(next){
  this.modified = Date.now;
  next();
});

mongoose.model('BackgroundReport', BackgroundReportSchema);
