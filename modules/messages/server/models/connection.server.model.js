'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment');


/**
 * Connection Schema
 */
var ConnectionSchema = new Schema({
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },

    validFrom: {
        type: Date,
        default: Date.now
    },

    validForDays: {
        type: Number,
        default: 30
    },

    validTo: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: ['closed', 'revoked', 'limited', 'full'],
        default: 'full'
    },

    created: {
        type: Date,
        default: Date.now
    },

    modified: {
        type: Date,
        default: Date.now
    }
}, {'toJSON': { virtuals: true }});

ConnectionSchema.virtual('isValid')
.get(function() {
        return checkValidity(this);
    });

ConnectionSchema.virtual('remainingDays')
.get(function() {
        if(this.isValid) {
            return moment(this.validTo).diff(moment(), 'days');
        }
        return -1;
    });

ConnectionSchema.pre('save', function(next) {
    debugger;
    if(!this.validTo && !!this.validForDays) {
        this.validTo = this.validFrom || new Date();
        console.log('Adding %d days to start date %s', this.validForDays, this.validTo);
        this.validTo.setDate(this.validTo.getDate() + this.validForDays);
        console.log('Connection valid until: %s', this.validTo);
    }

    //this.isValid = checkValidity(this);

    next();
});


//
//UserSchema.post('init', function(next) {
//    if (!this.displayName) {
//        this.displayName = this.firstName + ' ' + this.lastName;
//    }
//}

function checkValidity(cnxn) {
    var now = moment();

    if(!!cnxn.validTo) {
        return now.isBefore(cnxn.validTo);
    }
    if(!!cnxn.validFrom && !!cnxn.validForDays) {
        var validTo = moment(cnxn.validFrom).add(cnxn.validForDays, 'd');
        return now.isBefore(validTo);
    }
    if(_.contains(['closed', 'revoked'], cnxn.status)) {
        console.log('[Connection] Status is %s', cnxn.status);
        return false;
    }

    console.log('[Connection] Status is valid');
    return true;

}

mongoose.model('Connection', ConnectionSchema);
