'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
path = require('path'),
    RemoteFile = require(path.resolve('./modules/applications/server/models/remote-file.server.model.js'));

var ReleaseSchema = new Schema({
    signature: {
        dataUrl: {
            type: String,
            required: true
        },
        timestamp: Date
    },
    name: {
        first: {
            type: String,
            required: true
        },
        middle: {
            type: String,
            required: true
        },
        last: {
            type: String,
            required: true
        }
    },
    dob: {
        type: String,
        required: true
    },

    releaseType: {
        type: String,
        required: true
    },
    releaseText: {
        type: String,
        required: true
    },

    file: {
        type: RemoteFile,
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

ReleaseSchema.pre('save', function (next) {
    this.modified = Date.now();
    next();
});

mongoose.model('Release', ReleaseSchema);
