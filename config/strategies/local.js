'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User');

module.exports = function() {
    // Use local strategy
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function(username, password, done) {
            User
                .findOne({
                    username: username
                })
                .exec(function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false, {
                            message: 'Unknown user'
                        });
                    }
                    if (!user.authenticate(password)) {
                        return done(null, false, {
                            message: 'Invalid password'
                        });
                    }

                    console.log('[Local.Passport] User: ' + user);

                    return done(null, user);
                });
        }
    ));
};
