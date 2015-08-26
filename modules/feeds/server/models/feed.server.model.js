'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	path = require('path'),
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
	// Stores activity from other users
	items: {
		type: [{type: Schema.ObjectId, ref: 'FeedItem'}],
		default: []
	},
	// Stores the user's activty
	activity: {
		type: [{type: Schema.ObjectId, ref: 'FeedItem'}],
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
}, {toJSON: {virtuals:true}});

FeedSchema.index({ user: 'hashed' });

FeedSchema.pre('save', function (next) {
	if (this.isModified()) {
        this.modified = Date.now();
    }
	
	if(this.isNew) {
		this._id = this.user && this.user._id || this.user;
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
	location: {
		type: ['GeoJson'],
		default: null
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
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
		type: Schema.ObjectId,
		ref: 'User'
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
});

FeedItemSchema.pre('save', function (next) {
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
			enum: ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'],
			default: 'Point'
		},
		coordinates: [Number],
		// Alt, nested coordinates: [{type: [Number]}] per http://stackoverflow.com/a/15570602/609021

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