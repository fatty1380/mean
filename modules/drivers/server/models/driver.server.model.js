'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
moment       = require('moment'),
_            = require('lodash');


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

    //schedule: ['Schedule'],

    about: {
        type: String,
        default: ''
    },

    experience: [{
        title: {
            type: String
        },
        description: {
            type: String
        },

        //time: {
        //    start: {      // YYYY-MM-DD
        //        type: Date,
        //        default: null
        //    },
        //    end: {        // YYYY-MM-DD
        //        type: Date,
        //        default: null
        //    }
        //},

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
    }],

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

    reportsData: [{
        sku: String,
        name: String,
        url: String,
        expires: Date,
        bucket: String,
        key: String
    }],

    // TODO: Convert to 'documents'

    profile: [
        {
            listId: {
               type: Schema.ObjectId
            },
            responses: [{ id: String, value: String}],
            questions: [{ id: String, description: String, answer: String }]
        }
    ],

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
}, {toJSON: {virtuals: true}});

DriverSchema.methods.updateReportURL = function(sku, url) {
    var i = _.findIndex(this.reportsData, {sku: sku});

    if(i !== -1) {
        this.reportsData[i].url = url;
        this.reportsData[i].expires = moment().add(15, 'm');
        console.log('[DS.updateReportURL] updated reportsData[%d] to %j', i, this.reportsData[i]);
    }
};

DriverSchema.virtual('reports')
    .get(function () {
        return _.indexBy(this.reportsData, 'sku');
    });

DriverSchema.pre('save', function (next) {
    console.log('[DS.PRE] %s is about to be Saved', this._id);
    this.modified = Date.now();

    next();
});

DriverSchema.pre('save', function (next) {

    _.map(this.experience, function (exp) {
        if (!!exp._doc.time) {
            exp._doc.time = undefined;
        }

        return exp;
    });

    next();
});


DriverSchema.post('init', function (doc) {
    doc.experience = _.map(doc.experience, function (exp) {
        if (!!exp._doc.time) {
            translateTimes(exp);
        }

        return exp;
    });
});

DriverSchema.post('init', function (doc) {
    doc.experience = _.sortBy(doc.experience, function (exp) {
        if (!exp.endDate) {
            return 0;
        }

        return moment().diff(moment(exp.endDate), 'days');
    });
});

function translateTimes(doc) {
    var dt;
    if (!!(dt = doc._doc.time)) {
        if (!!dt.start) {
            if (!doc.startDate) {
                doc.startDate = moment(dt.start).format('YYYY-MM-DD');
            }

            doc._doc.time.start = null;
        }

        if (!!dt.end) {
            if (!doc.endDate) {
                doc.endDate = moment(dt.end).format('YYYY-MM-DD');
            }

            doc._doc.time.end = null;
        }
    }

    return doc;

}


mongoose.model('Driver', DriverSchema);
