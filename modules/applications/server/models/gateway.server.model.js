'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
    if(this.isNew()) {
        this.created = Date.now();
    }
    this.modified = Date.now();
    next();
});

mongoose.model('Gateway', GatewaySchema);
