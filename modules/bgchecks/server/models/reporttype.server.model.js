'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
Q            = require('q'),
_            = require('lodash');

/**
 * Report Type Schema
 * ----------------------------------------------------------------------
 * "productTypeId": 3,
 * "description": "OFAC Report",
 * "name": "OFAC",
 * "type": {
 *     "description": "Background Check - Criminal and Civil Records Searches",
 *     "productCategory": "Reports",
 *     "name": "Background Checks and Verifications"
 * },
 * "sku": "OFAC"
 *
 *
 *
 *
 *
 *
 *
 *


 */
var ReportTypeSchema = new Schema({

    /* Core information from eVerifile Servers */
    sku: {
        type: String,
        required: 'Report Types must have a SKU'
    },
    productTypeId: {
        type: Number,
        required: 'Report Types must have a productTypeId'
    },
    name: {
        type: String,
        required: 'Report Types must have a name'
    },
    description: {
        type: String,
        required: 'Report Types must have a description'
    },
    type: {
        description: String,
        productCategory: String,
        name: String
    },

    /**
     * Additional information for Outset Use
     */

    fields: ['ReportFieldDefinition'],

    /* Enabled/Disabled Control */
    enabled: {
        type: Boolean,
        default: false
    },

    /* Placeholder for pricing information */
    pricing: [{
        price: Number,
        valid: {
            from: Date,
            to: Date
        },
        conditions: String
    }],

    /* Bookkeeping information */

    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

ReportTypeSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

mongoose.model('ReportType', ReportTypeSchema);
