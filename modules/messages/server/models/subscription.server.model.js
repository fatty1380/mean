'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema       = mongoose.Schema;

/**
 * Subscription Schema
 */
var SubscriptionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    used: {
        type: Number,
        required: true
    },
    available: {
        type: Number,
        required: true
    },
    renews: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'past_due', 'canceled', 'pending'],
        default: 'active'
    },
    remoteSubscriptionId: {
        type: String,
        default: null
    },
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    created: {
        type: Date,
        default: Date.now
    },
    modified: {
        type: Date,
        default: Date.now
    }
}, {'toJSON': {virtuals: true}});


SubscriptionSchema.pre('save', function (next) {
    this.modified = Date.now();

    next();
});

SubscriptionSchema.virtual('isValid')
    .get(function() {
        return this.status === 'active' && (this.available === -1 || this.available > this.used);
    });

SubscriptionSchema.virtual('statusMessage')
    .get(function() {
        if(this.isValid) {
            if(this.available === -1) {
                return 'Posted ' + this.used + ' jobs on an Unlimited package';
            }
            else {
                return 'Posted ' + this.used + ' of ' + this.available + ' jobs this month';
            }
        }
        else {
            if(this.status !== 'active') {
                switch(this.status) {
                    case 'expired':
                        return 'Your subscription has expired';
                    case 'past_due':
                        return 'Your subscription payment is past due';
                    case 'canceled':
                        return 'Your subscription has been canceled';
                    case 'pending':
                        return 'Your subscription is pending. Please try again later';
                    default:
                        return '';
                }
            } else if (this.available <= this.used) {
                return 'You have used all of your available job posts this month.';
            }
        }
    });

mongoose.model('Subscription', SubscriptionSchema);

