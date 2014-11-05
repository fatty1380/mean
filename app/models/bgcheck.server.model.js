'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Bgcheck Schema
 */
var BgcheckSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Bgcheck name',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
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

BgcheckSchema.pre('save', function(next){
  this.modified = Date.now;
  next();
});

mongoose.model('Bgcheck', BgcheckSchema);
