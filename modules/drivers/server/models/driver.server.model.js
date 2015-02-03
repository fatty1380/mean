'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
moment       = require('moment'),
_            = require('lodash');

var experienceSchema = new Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    startDate: {      // YYYY-MM-DD
        type: String,
        default: null
    },
    endDate: {        // YYYY-MM-DD
        type: String,
        default: null
    },
    location: {
        type: String
    }
}, {_id: false})

/**
 * Driver Schema
 * user         User
 * address      [Address]
 * licenses     [License]
 * endorsements [{ ? }]
 * connections  [Connection]
 * experience   "text
 * time
 * location"
 * schedule     [Schedule]
 * isActive
 * isDeleted
 * created
 * modified
 */
var DriverSchema = new Schema({

    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },

    licenses: ['License'],

    schedule: ['Schedule'],

    about: {
        type: String,
        default: ''
    },

    experience: [experienceSchema],

    interests: {
        type: [{
            key: String,
            value: Boolean
        }],
        default: []
    },

    resume: {
        url: String,
        expires: Date,
        bucket: String,
        key: String
    },

    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
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

DriverSchema.pre('save', function (next) {
    this.modified = Date.now();

    next();
});

DriverSchema.post('init', function (doc) {
    doc.experience = _.sortBy(doc.experience, function (exp) {
        if (!exp.endDate) {
            return 0;
        }

        return moment().diff(moment(exp.endDate), 'days');
    });
});

experienceSchema.pre('save', function (next) {
    if(!!this._doc.time) {
        debugger;
        delete this._doc.time;
    }

    if (!!this.startDate) {
        this.startDate = moment(this.startDate).format('YYYY-MM-DD');
    }

    if (!!this.endDate) {
        this.endDate = moment(this.endDate).format('YYYY-MM-DD');
    }

    next();
});

experienceSchema.post('init', function(doc) {
    var dt;
    if(!!(dt = doc._doc.time)) {
        if(!!dt.start) {
            doc.startDate = moment(dt.start).format('YYYY-MM-DD');
        }

        if(!!dt.end) {
            doc.endDate = moment(dt.end).format('YYYY-MM-DD');
        }

        delete doc._doc.time;
    }
})

experienceSchema.post("init", function (doc) {
    if (!!doc.startDate) {
        doc.startDate = moment(doc.startDate, 'YYYY-MM-DD');
    }

    if (!!doc.endDate) {
        doc.endDate = moment(doc.endDate, 'YYYY-MM-DD');
    }
});

mongoose.model('Driver', DriverSchema);
