'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    path = require('path'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'bgchecks',
        file: 'bgcheck.model'
    });

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
            enum: ['UNKNOWN', 'SUBMITTED', 'INVOKED', 'ERRORED', 'RESPONDED', 'SUSPENDED', 'VALIDATED', 'REJECTED', 'QUEUED', 'FAILED', 'NEED_INFO', 'COMPLETED'],
            default: 'UNKNOWN'
        },
        requiredData: [{
            type: String
        }],
        completed: Boolean,
        timestamp: Date
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

    completed: {
        type: Date,
        default: null
    },

    data: {
        xml: String,
        raw: Schema.Types.Mixed
    },

    file: {
        url: String,
        expires: Date,
        bucket: String,
        key: String,
        timestamp: Date
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

        var retval = {};
        var statuses = this.statuses;
        var skus = this.remoteReportSkus && this.remoteReportSkus.split(',');
        skus = _.union(skus,_.unique(_.pluck(this.statuses, 'sku')));

        log.trace({func: 'latestStatuses', skus: skus},'Iterating over skus');

        _.each(skus, function (sku) {
            var stati = _.findLast(statuses, {sku: sku});

            retval[sku] = stati && stati.value || 'UNKNOWN';
            log.trace({func: 'latestStatuses'}, 'Report [%s] has status`%s`', sku, retval[sku]);
        });

        log.trace({func: 'latestStatuses', retval: retval},'Returning Latest Statuses');
        return retval;
    });

//Expected Remote Status Schema = {
//    'id': 93651,
//    'startDate': 1421384400000,
//    'completedDate': 1421691798000,
//    'applicant': {'id': 45958},
//    'report': {'sku': 'MVRDOM'},
//    'reportCheckStatus': {'timestamp': 1421691798000, 'status': 'COMPLETED'}
//};
BackgroundReportSchema.methods.addStatus = function (remoteStatus) {

    log.debug({func: 'addStatus'},'START', remoteStatus);
    var localStatus = {
        sku: remoteStatus.report.sku,
        value: remoteStatus.reportCheckStatus.status,
        completed: !_.isEmpty(remoteStatus.completedDate),
        timestamp: new Date(remoteStatus.reportCheckStatus.timestamp)
    };

    if(_.contains(this.statuses, localStatus)) {
        log.debug({func: 'addStatus'},'Already inserted - aborting');
        return false;
    }
    log.debug({func: 'addStatus'},' Adding new remote status', remoteStatus);

    this.statuses.push(localStatus);
    this.updateStatus();
    
    var statuses = this.latestStatuses;
    log.debug({ func: 'addStatus', statuses: statuses }, 'Looking at latest statuses');

    log.debug({func: 'addStatus', status: this.status, sku: statuses[localStatus.sku]}, 'RESULTS');

    return true;
};


var statusOrder = ['PAID', 'SUBMITTED', 'INVOKED', 'ERRORED', 'RESPONDED', 'VALIDATED', 'QUEUED', 'SUSPENDED', 'REJECTED', 'FAILED', 'NEED_INFO'];

BackgroundReportSchema.methods.updateStatus = function () {
    var index = 99;
    var latest = this.latestStatuses;
    log.debug({ func: 'updateStatus', latest: latest }, 'GOT latest statuses');
    var allComplete = !_.isEmpty(latest);

    log.debug({ func: 'updateStatus', allComplete: allComplete }, 'Completion Status');
    
    _.each(latest, function (status) {
        log.debug({func: 'updateStatus'}, 'evaluating status value %j', status);
        if (allComplete && (!status || status !== 'COMPLETED')) {
            log.debug({func: 'updateStatus'}, 'status is `%s` - marking incomplete', status);
            allComplete = false;
        }

        var i = _.indexOf(statusOrder,status);
        log.debug({func: 'updateStatus'}, 'status `%s` - with index %d', status, i);
        if (i < index) {
            log.debug({func: 'updateStatus'}, 'status `%s` is lower index than existing %d', status, index);
            index = i;
        }
    });
    
    log.debug({ func: 'updateStatus', allComplete: allComplete }, 'Finished -EACH- processing');

    if (allComplete) {
        log.info({func: 'updateStatus'}, 'All Reports are Complete!!!');
        this.status = 'COMPLETED';
        this.isComplete = true;
        this.completed = Date.now();
    } else if(index !== -1 && index !== 99) {
        this.status = statusOrder[index];
        log.info({func: 'updateStatus', index: index, status: this.status}, 'Reports are NOT Complete!!!');
    } else {
        this.status = 'UNKNOWN';
        log.info({func: 'updateStatus', index: index, status: this.status}, 'Reports are NOT Complete!!!');
    }


    log.debug({func: 'updateStatus'}, 'Final Status Result: %s', this.status);
};

mongoose.model('BackgroundReport', BackgroundReportSchema);
