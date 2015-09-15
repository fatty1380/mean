'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	moment = require('moment'),
    Schema = mongoose.Schema;

/**
 * Document Schema
 */
var DocumentSchema = new Schema({

	sku: String,
	name: String,
	isSecure: Boolean,
	url: String,
	expires: Date,
	bucket: String,
	key: String,

	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	},

	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});


DocumentSchema.pre('save', function (next) {
    if (!!this.isModified()) {
		this.modified = Date.now();
	}

    next();
});

DocumentSchema.methods.updateReportURL = function (url) {
        this.url = url;
        this.expires = moment().add(15, 'm').toDate();
        console.log('[DS.updateReportURL] updated document URL to %s', this.url);
};

mongoose.model('Document', DocumentSchema);