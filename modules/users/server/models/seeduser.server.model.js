'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SeedSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in your first name'
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		required: 'Please fill in your last name'
	},
    email: {
		type: String,
        unique: 'Username already exists',
        required: 'Please fill in your email address',
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},

    zip: {
        type: String,
        trim: true,
        default: ''
    },

    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    modified: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    }

});


SeedSchema.pre('save', function (next) {
    if (!!this.isModified()) {
        this.modified = Date.now();
    }
    next();
});

mongoose.model('SeedUser', SeedSchema);