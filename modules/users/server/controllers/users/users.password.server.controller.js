'use strict';

/**
 * Module dependencies.
 */
var _        = require('lodash'),
path         = require('path'),
config       = require(path.resolve('./config/config')),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
mongoose     = require('mongoose'),
passport     = require('passport'),
User         = mongoose.model('User'),
nodemailer   = require('nodemailer'),
crypto       = require('crypto'),
async        = require('async'),
crypto       = require('crypto'),
emailer      = require(path.resolve('./modules/emailer/server/controllers/emailer.server.controller'));

/** ------------------------------------------------------ **/
/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (req, res, next) {
    async.waterfall([
            // Generate random token
            function (done) {
                crypto.randomBytes(20, function (err, buffer) {
                    var token = buffer.toString('hex');
                    done(err, token);
                });
            },
            // Lookup user by username
            function (token, done) {
                if (req.body.username) {
                    User.findOne({
                        username: req.body.username
                    }, '-salt -password', function (err, user) {
                        if (!user) {
                            return res.status(400).send({
                                message: 'No account with that username has been found'
                            });
                        } else if (user.provider !== 'local') {
                            return res.status(400).send({
                                message: 'It seems like you signed up using your ' + user.provider + ' account'
                            });
                        } else {
                            user.resetPasswordToken = token;
                            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                            user.save(function (err) {
                                done(err, token, user);
                            });
                        }
                    });
                } else {
                    return res.status(400).send({
                        message: 'Username field must not be blank'
                    });
                }
            },
            function (token, user, done) {

                var resetURL = ((!!config.app.useLocalhost) ? 'http://localhost:3000' : 'https://www.joinoutset.com') + '/api/auth/reset/' + token;
                var templateName = 'outset-password-reset';

                console.log('Sending email template: %s', templateName);

                var mailOptions = {
                    to: [{
                        email: user.email,
                        name: user.displayName
                    }],
                    inline_css: true,

                    global_merge_vars: [
                        {
                            name: 'USERNAME',
                            content: user.firstName
                        },
                        {
                            name: 'RESET_URL',
                            content: resetURL
                        }
                    ]
                };

                console.log('With options: %j', mailOptions);

                var e = emailer.sendTemplate(templateName, mailOptions);

                if (!e) {
                    res.send({
                        message: 'An email has been sent to ' + user.email + ' with further instructions.'
                    });
                }

                done(e);
            }
        ],
        function (err) {
            if (err) {
                return next(err);
            }
        }
    );
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (!user) {
            return res.redirect('/#!/password/reset/invalid');
        }

        res.redirect('/#!/password/reset/' + req.params.token);
    });
};

/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
    // Init Variables
    var passwordDetails = req.body;
    var message = null;

    async.waterfall([

        function (done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function (err, user) {
                if (!err && user) {
                    if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                        user.password = passwordDetails.newPassword;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            if (err) {
                                console.log('Error of some sort: %j', err);
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                req.login(user, function (err) {
                                    if (err) {
                                        res.status(400).send(err);
                                    } else {
                                        // Return authenticated user
                                        res.json(user);

                                        done(err, user);
                                    }
                                });
                            }
                        });
                    } else {
                        console.log('Passwords do not match');
                        return res.status(400).send({
                            message: 'Passwords do not match'
                        });
                    }
                } else {
                    console.log('Password reset token is invalid or has expired.');
                    return res.status(400).send({
                        message: 'Password reset token is invalid or has expired.'
                    });
                }
            });
        },
        function (user, done) {
            res.render('modules/users/server/templates/reset-password-confirm-email', {
                name: user.displayName,
                appName: config.app.title
            }, function (err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        //function (emailHTML, user, done) {
        //    var message = emailer.getMessage(emailHTML);
        //},
        function (emailHTML, user, done) {

            console.log('Sending email: %s', emailHTML);

            var mailOptions = {
                to: {
                    email: user.email,
                    name: user.displayName
                },
                from: config.mailer.from,
                subject: 'Your password has been changed',
                html: emailHTML
            };

            console.log('With options: %j', mailOptions);

            var e = emailer.sendMessage(mailOptions);

            if (!e) {
                console.log('An email has been sent to ' + user.email + ' with confirmation');
            }

            done(e);
        }
    ], function (err) {
        if (err) {
            return next(err);
        }
    });
};

/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
    // Init Variables
    var passwordDetails = req.body;
    var message = null;

    if (req.user) {
        if (passwordDetails.newPassword) {
            User.findById(req.user.id, function (err, user) {
                if (!err && user) {
                    if (user.authenticate(passwordDetails.currentPassword)) {
                        if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
                            user.password = passwordDetails.newPassword;

                            user.save(function (err) {
                                if (err) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                } else {
                                    req.login(user, function (err) {
                                        if (err) {
                                            res.status(400).send(err);
                                        } else {
                                            res.send({
                                                message: 'Password changed successfully'
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            res.status(400).send({
                                message: 'Passwords do not match'
                            });
                        }
                    } else {
                        res.status(400).send({
                            message: 'Current password is incorrect'
                        });
                    }
                } else {
                    res.status(400).send({
                        message: 'User is not found'
                    });
                }
            });
        } else {
            res.status(400).send({
                message: 'Please provide a new password'
            });
        }
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

