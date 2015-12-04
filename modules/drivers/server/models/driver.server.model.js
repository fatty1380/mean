'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    moment = require('moment'),
    path = require('path'),
    UserModel = require(path.resolve('./modules/users/server/models/user.server.model')),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
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
            enum: ['A', 'B', 'C', 'D', '', null],
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

    // Remember to use markModified('props')
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

    experience: {
        type: [{
            title: {
                type: String
            },
            description: {
                type: String
            },
            company: {
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
        default: []
    },

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
    debugger;
    if (!!this.isModified('props') &&
        !!this.props.avatar &&
        this.props.avatar !== this.profileImageURL) {

        if (/^data:/.test(this.props.avatar)) {
            return saveImageToCloud(this, next)
                .then(function (result) {
                    log.info({ func: 'pre-save', profileImageURL: this.profileImageURL, avatar: this.props.avatar }, 'After Pre-Save');
                });
        }

        this.profileImageURL = this.props.avatar;
    }

    next();
});


DriverSchema.pre('init', function (next, data) {
    debugger;
    if (data.props &&
        !!data.props.avatar &&
        data.props.avatar !== data.profileImageURL) {

        if (/^data:/.test(this.props.avatar)) {
            return saveImageToCloud(this, next)
                .then(function success(updatedDoc) {
                    debugger;

                    if (!!updatedDoc) {
                        return mongoose.model('Driver').findByIdAndUpdate(data._id,
                            { profileImageURL: updatedDoc.profileImageURL, props: updatedDoc.props },
                            { new: true }).exec()
                            .then(function success(updatedUser) {
                                log.info({ func: 'pre-init:post-save', updatedPURL: updatedUser.profileImageURL, upAvatar: updatedUser.props && updatedUser.props.avatar }, 'Updated User to new URL');
                            })
                            .catch(function fail(omg) {
                                log.error({ func: 'pre-init:post-save', err: omg }, 'Updating user failed');
                            });
                    }
                });
        }

        this.profileImageURL = this.props.avatar;
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

/////////////////////////

function saveImageToCloud(data) {
    debugger;
    var post = {
        isSecure: false,
        content: data.profileImageURL
    };

    return fileUploader
        .saveContentToCloud(post)
        .then(
            function success(uploadResponse) {
                log.info({ func: 'saveImageToCloud', url: uploadResponse }, 'Uploaded Data to cloud');

                data.profileImageURL = uploadResponse.url;

                log.info({ func: 'saveImageToCloud', updatedUser: data }, 'Updated User to new URL');

                return uploadResponse;
            })
        .catch(
            function fail(err) {
                log.error({ func: 'saveImageToCloud', err: err }, 'Failed to upload base64 data to cloud');
            })
        .then(function (saveResult) {
            if (!!saveResult && saveResult.url) {

                log.info({ func: 'saveImageToCloud', hasDoc: !!data._doc, hasDocAvatar: data._doc && data._doc.props && !!data._doc.props.avatar, hasAvatar: !!data.avatar }, 'Avatar Props Status');

                if (data.profileImageURL !== saveResult.url) {
                    debugger;
                    log.error({ func: 'saveImageToCloud', profileImage: data.profileImageURL }, 'Profile Image URL was not updated');
                }

                if (data._doc && data.doc.props) {
                    log.info({ func: 'saveImageToCloud' }, 'Deleting _doc level avatar');
                    data._doc.props.avatar = saveResult.url;
                } else {
                    log.info({ func: 'saveImageToCloud' }, 'Deleting prop level avatar');
                    data.props.avatar = saveResult.url;
                }
            }

            return data;
        });
}