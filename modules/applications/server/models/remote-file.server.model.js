'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema;

var RemoteFileSchema = new Schema({

    owner: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },

    sku: {
        type: String,
        default: null,
        required: true
    },
    name: {
        type: String,
        default: null
    },

    isSecure: {
        type: Boolean,
        default: false
    },

    url: {
        type: String,
        default: null
    },
    expires: {
        type: Date,
        default: null
    },
    bucket: {
        type: String,
        default: null
    },
    key: {
        type: String,
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

    /* Virtual Members - END */
}, {'toJSON': {virtuals: true}});

RemoteFileSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

mongoose.model('RemoteFile', RemoteFileSchema);
