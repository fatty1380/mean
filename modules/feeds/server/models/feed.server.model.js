'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

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
		type: [{type: Schema.ObjectId, ref: 'Feed.activity'}],
		default: []
	},
	// Stores the user's activty
	activity: {
		type: [{type: Schema.ObjectId, ref: 'Feed.activity'}],
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
		this._id = this.user._id;
	}
	
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
	location: {
		type: {
			type: String,
			enum: ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'],
			default: 'Point'
		},
		coordinates: [Number]
		// Alt, nested coordinates: [{type: [Number]}] per http://stackoverflow.com/a/15570602/609021
	},

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