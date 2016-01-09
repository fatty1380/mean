'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
_            = require('lodash'),
path         = require('path'),
log          = require(path.resolve('./config/lib/logger')).child({
    module: 'addresses',
    file: 'Address.Model'
}),
constants    = require(path.resolve('./modules/core/server/models/outset.constants'));


function validateState(val) {
    return _.isEmpty(val) || _.contains(constants.stateAbbreviations, val);
}

/**
 * Address Schema
 */
var AddressSchema = new Schema({
    type: {
        type: String,
        default: 'main',
        required: 'Please specify an address type',
        enum: ['main', 'home', 'business', 'billing', 'other']
    },

    typeOther: {
        type: String,
        default: null,
        trim: true
    },

    streetAddresses: {
        type: [String],
        default: [null,null],
        trim: true
    },

    city: {
        type: String,
        default: '',
        trim: true
    },

    state: {
        type: String,
        default: null,
        validate: validateState
    },

    zipCode: {
        type: String,
        default: '',
        match: [/\d{5}(\-\d{4})?/],
        trim: true
    }
}, { toJSON: { virtuals: true } });

AddressSchema.virtual('line1')
    .get(function () {
        return this.streetAddresses.length > 0 ? this.streetAddresses[0] : '';
    })
    .set(function (value) {
        this.streetAddresses[0] = value;
    });
    
AddressSchema.virtual('line2')
    .get(function () {
        return this.streetAddresses.length > 1 ? this.streetAddresses[1] : '';
    })
    .set(function (value) {
        this.streetAddresses[1] = value;
    });
    

AddressSchema.virtual('empty')
    .get(function () {
        log.trace('virtual.empty', 'GET');
        var compacted = _.compact([_.compact(this.streetAddresses).length, this.city, this.state, this.zipCode]);
        log.trace('virtual.empty', {vals: compacted, isEmpty: _.isEmpty(compacted)});

        return _.isEmpty(compacted);
    });

AddressSchema.virtual('zipOnly')
    .get(function () {
        log.trace('virtual.zipOnly', 'GET');
        var others = _.compact([_.compact(this.streetAddresses).length, this.city, this.state]);
        log.trace('virtual.zipOnly', {val: this.zipCode, zipIsEmpty: _.isEmpty(this.zipCode), others: others});
        return !_.isEmpty(this.zipCode) && _.isEmpty(others);
    });

AddressSchema.virtual('searchString')
    .get(function () {
        log.trace('virtual.searchString', 'GET');
        var street = this.streetAddresses.join(' ');

        return _.compact([street, this.city, this.state, this.zipCode]).join(' ');
    });

AddressSchema.pre('init', function (next, data) {
    log.trace('pre.init', {streetAddresses: data.streetAddresses});

    this._doc.streetAddresses = _.compact(data.streetAddresses);

    next();
});

AddressSchema.pre('validate', function (next) {
    log.trace('pre.validate');

    this.state = _.isEmpty(this.state) ? null : this.state.toUpperCase();
    next();
});

AddressSchema.pre('save', function (next) {
    log.trace('pre.save');
    this.streetAddresses = _.compact(this.streetAddresses);
    next();
});

AddressSchema.statics.map = function(source) {
    var Address = this;

    return _.map(source, function (location) {
        log.trace('pre.validate', 'Mapping location', {Address: location, isAddress: (location instanceof Address)});
        return (location instanceof Address) ? location : new Address(location);
    });
};

mongoose.model('Address', AddressSchema);
