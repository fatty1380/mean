'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users.models',
        file: 'login.branch.schemas'
    });

var Login = new Schema({

    input: {
        type: String,
        default: null
    },

    attempt: {
        type: String,
        default: null
    },

    userId: {
        type: String,
        default: null
    },

    result: {
        type: String,
        default: null
    },

    ip: {
        type: String,
        default: null
    },

    client: {
        type: String,
        default: null
    },

    created: {
        type: Date,
        default: Date.now
    }

});


Login.pre('save', function (next) {

    if (!!this.attempt) {
        var buffer = new Buffer(config.security.randomB64, 'base64');
        console.log('buffer: ', buffer);
        this.attempt = crypto.pbkdf2Sync(this.attempt, buffer, 10000, 64)
            .toString('base64');
    }
    next();
});

mongoose.model('Login', Login);



var BranchData = new Schema({

    user: {
        type: Schema.ObjectId,
        required: true,
        ref: 'User'
    },

    data: {
        type: Schema.Types.Mixed,
        default: null
    },

    referralCode: {
        type: String,
        default: null
    },

    status: {
        type: String,
        default: 'new' // ['new', 'processed', 'rejected']
    },

    created: {
        type: Date,
        default: Date.now
    }
});



BranchData.pre('save', function (next) {

    log.debug({ func: 'branch.preSave', model: this, keys: _.keys(this.data) }, 'Examining Keys');
    debugger;
    _.forOwn(this.data, function (value, key) {
        if (/^[~\$\+]/.test(key)) {
            var newKey = key.substring(1);

            log.debug({ func: 'branch.preSave' }, 'Renaming Key from %s to %s', key, newKey);
            debugger;

            this.data[newKey] = value;
            delete this.data[key];

            log.debug({ func: 'branch.preSave', newKeyVal: this.data[newKey], oldKeyVal: this.data[key] }, 'Renaming Key from %s to %s', key, newKey);
        }
    }, this);
    
    if (/undefined/.test(this.referralCode)) {
        delete this.referralCode;
    }

    next();
});

mongoose.model('BranchData', BranchData);