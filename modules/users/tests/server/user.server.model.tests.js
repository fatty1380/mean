'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
mongoose   = require('mongoose'),
User       = mongoose.model('User'),
SeedUser       = mongoose.model('SeedUser'),
Driver     = mongoose.model('Driver'),
Company    = mongoose.model('Company'),
_          = require('lodash'),
Q          = require('q');

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

        it('should be a driver by default', function (done) {
            delete user.type;
            return user.save(function (err) {
                should.not.exist(err);

                should(user).have.property('type', 'driver');

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

                    driver.user.equals(user).should.be.true;

                    user.driver = driver;

                    user.save(function (err, dbUser) {
                        should.not.exist(err);
                        should.exist(dbUser);

                        user.driver.equals(driver).should.be.true;

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
                    company.owner.equals(user).should.be.true;

                    user.company = company;

                    user.save(function (err, dbUser) {
                        should.not.exist(err);
                        should.exist(dbUser);

                        user.company.equals(company).should.be.true;

                        done();
                    });
                });
            });
        });

        it('should allow both a driver and company profile to exist', function (done) {
            var company, driver;

            user.save()
                .then(function (user) {
                    company = new Company({owner: user, name: 'My Super Company, llc.'});
                    driver = new Driver({user: user});

                    return Q.all({company: company.save(), driver: driver.save()});
                },done)
                .then(function (result) {

                    company.owner.equals(user).should.be.true;
                    driver.user.equals(user).should.be.true;

                    user.company = company;
                    user.driver = driver;

                    return user.save();

                },done)
                .then(function (user) {
                    should.exist(user);

                    user.company.equals(company).should.be.true;
                    user.driver.equals(driver).should.be.true;
                })
                .then(done);
        });

        it('should be able to save an address to this user', function (done) {
            var address = {
                streetAddresses: ['123 Fake Street'],
                city: 'Anywhere',
                state: 'MN',
                zipCode: '90210'
            };

            user.addresses.push(address);

            user.save()
                .then(function (user) {
                    user.should.have.property('addresses').with.lengthOf(1);

                    var newAddr = user.addresses[0];

                    newAddr.should.have.property('streetAddresses').with.lengthOf(1);
                    newAddr.should.have.property('city', address.city);
                    newAddr.should.have.property('state', address.state);
                    newAddr.should.have.property('zipCode', address.zipCode);
                },
                function (err) {
                    should.not.exist(err);
                })
                .then(function () {
                    done();
                });
        });
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
        });
    });

    describe('Method remove', function () {
        it('should remove any driver records associated with the user');
        it('should remove any company records where the user is the only associated user');
        it('should keep any company records where the user is NOT the only associated user');
    });

    describe('Special functionality for "SEED" users', function() {
        var seed;
        beforeEach(function(done) {
            seed = new SeedUser({
                firstName: 'Signup',
                lastName: 'User',
                email: 'signuponly@seed.com'
            });

            done();
        });

        it('should allow a minimal signup to be allowed by the db', function(done) {
            seed.save(function (err) {
                if (!!err) {
                    console.log('[ERROR] Saving user: ', err);
                }
                should.not.exist(err && err.message);

                done();
            });
        });

        afterEach(function(done) {

            SeedUser.remove().exec();

            done();
        });

    });

    afterEach(function (done) {
        Driver.remove().exec();
        Company.remove().exec();
        User.remove().exec();

        done();
    });
})
;
