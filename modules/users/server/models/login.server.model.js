'use strict';

var mongoose = require('mongoose'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    Schema = mongoose.Schema,
    crypto = require('crypto');

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
        default: 'new'
    },

    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('BranchData', BranchData);