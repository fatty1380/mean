'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	path = require('path'),
	_ = require('lodash'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'feed',
        file: 'server.model'
    });

/**
 * Feed Schema
 */
var FeedSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Feeds must be associated with a user',
		unique: true
	},
	company: {
		type: Schema.ObjectId,
		ref: 'Company',
		unique: true
	},
	// Stores activity from other users
	items: {
		type: [{ type: Schema.ObjectId, ref: 'FeedItem' }],
		default: []
	},
	// Stores the user's activty
	activity: {
		type: [{ type: Schema.ObjectId, ref: 'FeedItem' }],
		//type: ['FeedItem'],
		default: []
	},

	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	},
}, { toJSON: { virtuals: true } });

FeedSchema.index({ user: 'hashed' });

FeedSchema.pre('save', function (next) {
	if (this.isModified()) {
        this.modified = Date.now();
    }

	if (this.isNew) {
		if (!!this.company) {
			this._id = this.company._id || this.company;
		} else {
			this._id = this.user && this.user._id || this.user;
		}
	}

	log.debug({ func: 'pre-save', new: this.isNew, mod: this.isModified(), doc: this }, 'logging doc status');

    next();
});

mongoose.model('Feed', FeedSchema);

// ----------------------------------------------//

var FeedItemSchema = new Schema({
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Please fill in Title'
	},
	message: {
		type: String,
		default: '',
		trim: true
	},
	_location: {
		type: ['GeoJson'],
		default: null
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	company: {
		type: Schema.ObjectId,
		ref: 'Company'
	},
    props: {
        type: Schema.Types.Mixed,
        default: {
            'freight': null,
			'slMiles': null
        }
    },
	comments: {
		type: ['Message'],
		default: []
	},
	likes: {
		type: [{
			type: Schema.ObjectId,
			ref: 'User'
		}],
		default: []
	},
	isPublic: {
		type: Boolean,
		default: false,
		enum: [false]
	},
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	},
}, { toJSON: { virtuals: true } });

FeedItemSchema.virtual('location')
	.get(function () {
		log.trace({ func: 'virtual.location', value: this._location }, 'YO! Returning `location` (first item in array)');
		return _.isEmpty(this._location) ? null : this._location[0];
	})
	.set(function (value) {
		log.debug({ func: 'FeedItem.location.set', value: value }, 'Setting value into _location');
		this._location = [value];
	});

FeedItemSchema.pre('save', function (next) {
	log.debug({ func: 'pre-save', doc: this }, 'Checking Migrated Feed Item for Modifications');
    if (this.isModified()) {
        this.modified = Date.now();
    }
    next();
});

mongoose.model('FeedItem', FeedItemSchema);

// ----------------------------------------------//



var GeoJsonSchema = new Schema({
	type: {
		type: String,
		enum: ['Point', 'LineString'], //, 'MultiPoint', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'],
		default: 'Point'
	},
	coordinates: [Number],
	// Alt, nested coordinates: [{type: [Number]}] per http://stackoverflow.com/a/15570602/609021

	placeId: String,
	placeName: String,
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	}

});

GeoJsonSchema.index({ location: '2dsphere' });

GeoJsonSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.modified = Date.now();
    }
    next();
});

mongoose.model('GeoJson', GeoJsonSchema);