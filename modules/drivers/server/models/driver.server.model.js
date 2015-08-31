'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    moment = require('moment'),
    path = require('path'),
    UserModel = require(path.resolve('./modules/users/server/models/user.server.model')),
    _ = require('lodash'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'drivers',
        file: 'driver.server.model'
    });

var Schema = mongoose.Schema,
    UserSchema = mongoose.model('User').schema;


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
var DriverSchema = UserSchema.extend({

    handle: {
        type: String,
        trim: true,
        default: null
    },

    license: {
        class: {
            type: String,
            enum: ['A', 'B', 'C', 'D', null],
            default: null
        },
        endorsements: {
            type: [String],
            default: []
        },
        state: {
            type: String,
            default: null,
            trim: true
        }
    },

    about: {
        type: String,
        default: null
    },

    props: {
        type: Schema.Types.Mixed,
        default: {
            'started': null,
            truck: null,
            trailer: [],
            freight: null,
            company: null
        }
    },

    experience: [{
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
    }],

    interests: {
        type: [{
            key: String,
            value: Boolean
        }],
        default: []
    },

    reportsData: {
        type: [{
            sku: String,
            name: String,

            url: String,
            expires: Date,
            bucket: String,
            key: String
        }],
        default: []
    }
});

DriverSchema.statics.fields = {
    social: [UserSchema.statics.fields.social, 'handle', 'props', 'license', 'about', 'experience', 'interests'].join(' ')
};

DriverSchema.virtual('reports')
    .get(function () {
        return _.indexBy(this.reportsData, 'sku');
    });

DriverSchema.pre('save', function (next) {
    if (!!this.isModified()) {
        this.modified = Date.now();
    }

    next();
});

DriverSchema.pre('save', function (next) {
    if (this.isModified('experience')) {

        _.map(this.experience, function (exp) {
            if (!!exp._doc.time) {
                exp._doc.time = undefined;
            }

            return exp;
        });

    }

    if (!!this.resume) {
        console.log('PRE Save Resume still here! aargh ===========================================P');
        this.resume = undefined;
    }

    if (!_.isEqual(this.reportsData, _.values(this.reports))) {
        this.reportsData = _.values(this.reports);
    }

    next();
});


DriverSchema.pre('init', function (next, data) {

    if (!!data.resume && !_.find(data.reportsData, { sku: 'resume' })) {
        data.reportsData = data.reportsData || [];
        console.log('Migrating Resume to Documents Array: %j in migration', data.reportsData);
        data.resume.sku = 'resume';
        data.resume.name = 'Resume';
        data.reportsData.push(data.resume);
        data.resume = undefined;
    } else if (!!data.resume) {
        debugger;
        console.log('Resume already migrated ... eliminating it');
        data.resume = undefined;
    }

    data.modifedField = 'reportsData';

    next();
});


DriverSchema.post('init', function (doc) {
    debugger;

    if (!!doc.modifiedField) {
        doc.setModified(doc.modifedField);
    }
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

log.debug({ func: 'register' }, 'Registering `Driver` with mongoose');

mongoose.model('Driver', DriverSchema);
