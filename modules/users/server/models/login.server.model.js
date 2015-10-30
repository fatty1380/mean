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
    this.attempt = crypto.pbkdf2Sync(this.attempt, new Buffer(config.sessionSecret, 'base64'), 10000, 64)
        .toString('base64');
    next();
});

mongoose.model('Login', Login);