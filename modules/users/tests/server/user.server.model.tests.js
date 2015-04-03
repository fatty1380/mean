'use strict';

/**
 * Module dependencies.
 */
var should   = require('should'),
    mongoose = require('mongoose'),
    User     = mongoose.model('User'),
    Driver   = mongoose.model('Driver'),
    Company  = mongoose.model('Company'),
    _        = require('lodash');

/**
 * Globals
 */
var user;

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function () {

    beforeEach(function (done) {
        user = new User({
            firstName: 'User',
            lastName: 'One',
            email: 'user1@test.com',
            username: 'username',
            password: 'password',
            provider: 'local',
            type: 'driver'
        });

        done();
    });

    it('should begin with no users', function (done) {
        User.find({}, function (err, users) {
            users.should.have.length(0);
            done();
        });
    });

    describe('Method Save', function () {

        it('should be able to save without problems', function (done) {
            user.save(function (err) {
                if (!!err) {
                    console.log('[ERROR] Saving user: ', err);
                }
                should.not.exist(err);

                done();
            });
        });

        it('should fail to save an existing user again', function (done) {

            var user2 = new User(_.clone(user, true));

            user.save(function () {
                user2.save(function (err) {
                    should.exist(err);
                    done();
                });
            });
        });

        it('should be able to show an error when try to save without first name', function (done) {
            user.firstName = '';
            return user.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when try to save without last name', function (done) {
            user.lastName = '';
            return user.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should use an email in place of username when username is not provided', function (done) {
            user.username = null;
            user.save(function (err) {
                if (!!err) {
                    console.log('[ERROR] Saving user: ', err);
                }
                should.not.exist(err);

                user.should.have.property('username', user.email);

                done();
            });
        });

        it('should be able to save a new driver profile to a user', function (done) {
            user.save(function (err) {
                var driver = new Driver({user: user});

                driver.save(function (err) {
                    should.not.exist(err);
                    driver.user.equals(user._id).should.be.ok;

                    user.driver = driver;

                    user.save(function (err, dbUser) {
                        should.not.exist(err);
                        should.exist(dbUser);

                        user.driver.equals(driver._id).should.be.ok;

                        done();
                    });
                });
            });
        });

        it('should be able to save a new company profile to a user', function (done) {
            user.save(function (err) {
                var company = new Company({owner: user, name: 'My Super Company, llc.'});

                company.save(function (err) {
                    should.not.exist(err);
                    company.owner.equals(user._id).should.be.ok;

                    user.company = company;

                    user.save(function (err, dbUser) {
                        should.not.exist(err);
                        should.exist(dbUser);

                        user.company.equals(company._id).should.be.ok;

                        done();
                    });
                });
            });
        });

        it('should allow both a driver and company profile to exist');
        it('should be able to save an address to this user');
        it('should be able to save multiple addresses');
        it('should be able to mark a single address as the primary address');
    });

    describe('Disabling a User', function () {
        it('should disable any driver records associated with the user');
        it('should disable any company records where the user is the only associated user');
        it('should NOT disable any company records where the user is NOT the only associated user');
    });

    describe('Method Update(?)', function () {
        it('should allow update to an existing user without overwriting the existing password & salt', function (done) {
            user.save(function (err) {
                var pw = user.password;
                var salt = user.salt;

                user.phone = '123-456-7389';
                user.profileImageURL = 'profile.png';

                user.save(function (err, dbUser) {
                    should.not.exist(err);
                    should.exist(dbUser);

                    dbUser.should.have.property('password', pw);
                    dbUser.should.have.property('salt', salt);

                    done();
                });
            });
        })
    });

    describe('Method remove', function () {
        it('should remove any driver records associated with the user');
        it('should remove any company records where the user is the only associated user');
        it('should keep any company records where the user is NOT the only associated user');
    });

    afterEach(function (done) {
        Driver.remove().exec();
        Company.remove().exec();
        User.remove().exec();

        done();
    });
});
