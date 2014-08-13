'use strict';

/**
 * Module dependencies.
 */
var mongoose = require( 'mongoose' ),
    Job = mongoose.model( 'Job' ),
    Address = mongoose.model( 'Address' ),
    _ = require( 'lodash' );

/**
 * Get the error message from error object
 */
var getErrorMessage = function( err ) {
    var message = '';

    if ( err.code ) {
        switch ( err.code ) {
            case 11000:
            case 11001:
                message = 'Job already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for ( var errName in err.errors ) {
            if ( err.errors[ errName ].message ) message = err.errors[ errName ].message;
        }
    }

    return message;
};

/**
 * Create a Job
 */
exports.create = function( req, res ) {

    var address = new Address( req.body.location );

    address.save( function( err ) {
        if ( err ) {
            return res.send( 400, {
                message: getErrorMessage( err )
            } );

        } else {
            req.body.location = address._id;
            var job = new Job( req.body );
            job.user = req.user;

            job.save( function( err ) {
                if ( err ) {
                    return res.send( 400, {
                        message: getErrorMessage( err )
                    } );
                } else {
                    res.jsonp( job );
                }
            } );
        }
    } );


};

/**
 * Show the current Job
 */
exports.read = function( req, res ) {
    res.jsonp( req.job );
};

/**
 * Update a Job
 */
exports.update = function( req, res ) {
    var job = req.job;
    var address = job.location;

    job = _.extend( job, req.body );
    address = _.extend( address, req.body.location );

    address.save( function( err ) {
        if ( err ) {
            return res.send( 400, {
                message: getErrorMessage( err )
            } );
        } else {
            job.save( function( err ) {
                if ( err ) {
                    return res.send( 400, {
                        message: getErrorMessage( err )
                    } );
                } else {
                    res.jsonp( job );
                }
            } );
        }
    } );


};

/**
 * Delete an Job
 */
exports.delete = function( req, res ) {
    var job = req.job;

    job.remove( function( err ) {
        if ( err ) {
            return res.send( 400, {
                message: getErrorMessage( err )
            } );
        } else {
            res.jsonp( job );
        }
    } );
};

/**
 * List of Jobs
 */
exports.list = function( req, res ) {
    Job.find()
        .sort( '-created' )
        .populate( 'user', 'displayName' )
        .populate( 'location' )
        .exec( function( err, jobs ) {
            if ( err ) {
                return res.send( 400, {
                    message: getErrorMessage( err )
                } );
            } else {
                res.jsonp( jobs );
            }
        } );
};

/**
 * Job middleware
 */
exports.jobByID = function( req, res, next, id ) {
    Job.findById( id )
        .populate( 'user', 'displayName' )
        .populate( 'location' )
        .exec( function( err, job ) {
            if ( err ) return next( err );
            if ( !job ) return next( new Error( 'Failed to load Job ' + id ) );
            req.job = job;
            next();
        } );
};

/**
 * Job authorization middleware
 */
exports.hasAuthorization = function( req, res, next ) {
    if ( req.job.user.id !== req.user.id ) {
        return res.send( 403, 'User is not authorized' );
    }
    next();
};
