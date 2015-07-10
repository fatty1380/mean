'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
_            = require('lodash'),
Schema       = mongoose.Schema;

var GatewaySchema = new Schema({

    sku: {
        type: String,
        default: null // 'OUTSET_MVR'
    },
    required: {
        type: Boolean,
        default: false
    },
    payment: {
        type: String,
        enum: ['applicant', 'company', 'mixed', ''],
        default: 'applicant' //'company'
    },
    releaseType: {
        type: String,
        default: null//'preEmployment'
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

GatewaySchema.pre('save', function (next) {
    if (_.isUndefined(this.isNew) || _.isFunction(this.isNew) ? this.isNew() : !!this.isNew) {
        this.created = Date.now();
    }
    if (!_.isFunction(this.isModified) || this.isModified()) {
        this.modified = Date.now();
    }
    next();
});

mongoose.model('Gateway', GatewaySchema);
