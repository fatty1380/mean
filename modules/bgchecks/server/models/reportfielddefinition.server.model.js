'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema;

var ReportFieldDefinitionSchema = new Schema({

    /** Core information from eVerifile Servers --------------------------*/

    description: String,

    name: String,
    length: Number,
    type: {
        type: String,
        enum: ['string', 'datelong', 'state', 'country', 'object', 'array']
    },
    required: Boolean,

    pickList: [{
        description: String,
        value: String
    }],

    /* Matches with 'object' and 'array' types */
    dataFields: ['ReportFieldDefinition'],
    
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

ReportFieldDefinitionSchema.pre('save', function (next) {
    this.modified = Date.now;
    next();
});

mongoose.model('ReportFieldDefinition', ReportFieldDefinitionSchema);
