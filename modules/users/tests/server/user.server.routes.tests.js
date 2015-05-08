'use strict';

var should = require('should'),
    Q = require('q'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    SeedUser = mongoose.model('SeedUser'),
    express = require(path.resolve('./config/lib/express')),
    request = require('supertest-as-promised')(Q.Promise),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'article.routes.test',
        file: 'article.server.routes.test'
    });

/**
 * Globals
 */
var app, agent, credentials, user, seeduser;


describe('Seed User CRUD tests', function () {
    before(function (done) {
        // Get application
        app = express.init(mongoose).http;
        agent = request.agent(app);

        done();
    });

    beforeEach(function (done) {
        seeduser = {
            firstName: 'Signup',
            lastName: 'User',
            email: 'signuponly@seed.com'
        };

        done();
    });

    it('Should allow me to crate a basic seed user', function (done) {
        agent.post('/api/seed')
            .send(seeduser)
            .expect(200)
            .then(function (seedResponse) {
                log.debug({response: seedResponse.body}, 'Got Response');

                seedResponse.should.have.property('body');

                var newSeed = seedResponse.body;

                newSeed.should.have.property('_id');
                newSeed.should.have.property('firstName', seeduser.firstName);
                newSeed.should.have.property('lastName', seeduser.lastName);
                newSeed.should.have.property('email', seeduser.email);

                done();
            }, done);
    });

    it('Should not allow me to create a seed user for an email that is already seeded', function (done) {
        this.timeout(5000);

        agent.post('/api/seed')
            .send(seeduser)
            .expect(200)
            .then(function (seedResponse) {

                return agent.post('/api/seed')
                    .send(seeduser)
                    .expect(400);
            })
            .then(function (response) {
                log.debug('Got response from dupe seed user');

                response.should.have.property('error');
                response.error.should.have.property('text');

                done();
            })
            .catch(function (err) {
                log.debug(err, 'Got ERR response creating seed user');

                should.not.exist(err);

                done();
            });
    });

    afterEach(function (done) {
        SeedUser.remove().exec(function () {
            done();
        });
    });
});


/**
 * User routes tests
 */
describe.skip('User CRUD tests', function () {
    before(function (done) {
        // Get application
        app = express.init(mongoose).http;
        agent = request.agent(app);

        done();
    });

    beforeEach(function (done) {
        // Create user credentials
        credentials = {
            username: 'username',
            password: 'password'
        };

        // Create a new user
        user = new User({
            firstName: 'Full',
            lastName: 'Name',
            displayName: 'Full Name',
            email: 'test@test.com',
            username: credentials.username,
            password: credentials.password,
            provider: 'local',
            type: 'driver'
        });

        // Save a user to the test db and create new article
        user.save()
            .then(function (userResult) {
                article = {
                    title: 'Article Title',
                    content: 'Article Content'
                };

                done();
            }, function (err) {
                log.error({error: err}, 'Error saving user');
                done(err, err.message);
            });
    });

    it('should be able to save an article if logged in', function (done) {
        var userId;

        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .then(function (signinRes) {
                log.trace('POSTED Login');
                // Get the userId
                userId = user.id;

                // Save a new article
                return agent.post('/api/articles')
                    .send(article)
                    .expect(200);
            })
            .then(function (articleSaveRes) {
                // Get a list of articles
                return agent.get('/api/articles');
            })
            .then(function (articlesGetRes) {

                // Get articles list
                var articles = articlesGetRes.body;

                // Set assertions
                (articles[0].user._id).should.equal(userId);
                (articles[0].title).should.match('Article Title');

                // Call the assertion callback
                done();
            })
            .catch(function (err) {
                log.error({error: err}, 'Error saving user');
                done(err);
            });
    });

    it('should not be able to save an article if not logged in', function (done) {
        agent.post('/api/articles')
            .send(article)
            .expect(403)
            .end(function (articleSaveErr, articleSaveRes) {
                // Call the assertion callback
                done(articleSaveErr);
            });
    });

    it('should not be able to save an article if no title is provided', function (done) {
        // Invalidate title field
        article.title = '';

        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new article
                agent.post('/api/articles')
                    .send(article)
                    .expect(400)
                    .end(function (articleSaveErr, articleSaveRes) {
                        // Set message assertion
                        (articleSaveRes.body.message).should.match('Title cannot be blank');

                        // Handle article save error
                        done(articleSaveErr);
                    });
            });
    });

    it('should be able to update an article if signed in', function (done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new article
                agent.post('/api/articles')
                    .send(article)
                    .expect(200)
                    .end(function (articleSaveErr, articleSaveRes) {
                        // Handle article save error
                        if (articleSaveErr) {
                            done(articleSaveErr);
                        }

                        // Update article title
                        article.title = 'WHY YOU GOTTA BE SO MEAN?';

                        // Update an existing article
                        agent.put('/api/articles/' + articleSaveRes.body._id)
                            .send(article)
                            .expect(200)
                            .end(function (articleUpdateErr, articleUpdateRes) {
                                // Handle article update error
                                if (articleUpdateErr) {
                                    done(articleUpdateErr);
                                }

                                // Set assertions
                                (articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                                (articleUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    it('should be able to get a list of articles if not signed in', function (done) {
        // Create new article model instance
        var articleObj = new Article(article);

        // Save the article
        articleObj.save(function () {
            // Request articles
            request(app).get('/api/articles')
                .end(function (req, res) {
                    // Set assertion
                    res.body.should.be.an.Array.with.lengthOf(1);

                    // Call the assertion callback
                    done();
                });

        });
    });


    it('should be able to get a single article if not signed in', function (done) {
        // Create new article model instance
        var articleObj = new Article(article);

        // Save the article
        articleObj.save(function () {
            request(app).get('/api/articles/' + articleObj._id)
                .end(function (req, res) {
                    // Set assertion
                    res.body.should.be.an.Object.with.property('title', article.title);

                    // Call the assertion callback
                    done();
                });
        });
    });

    it('should be able to delete an article if signed in', function (done) {
        agent.post('/api/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) {
                    done(signinErr);
                }

                // Get the userId
                var userId = user.id;

                // Save a new article
                agent.post('/api/articles')
                    .send(article)
                    .expect(200)
                    .end(function (articleSaveErr, articleSaveRes) {
                        // Handle article save error
                        if (articleSaveErr) {
                            done(articleSaveErr);
                        }

                        // Delete an existing article
                        agent.delete('/api/articles/' + articleSaveRes.body._id)
                            .send(article)
                            .expect(200)
                            .end(function (articleDeleteErr, articleDeleteRes) {
                                // Handle article error error
                                if (articleDeleteErr) {
                                    done(articleDeleteErr);
                                }

                                // Set assertions
                                (articleDeleteRes.body._id).should.equal(articleSaveRes.body._id);

                                // Call the assertion callback
                                done();
                            });
                    });
            });
    });

    it('should not be able to delete an article if not signed in', function (done) {
        // Set article user
        article.user = user;

        // Create new article model instance
        var articleObj = new Article(article);

        // Save the article
        articleObj.save(function () {
            // Try deleting article
            request(app).delete('/api/articles/' + articleObj._id)
                .expect(403)
                .end(function (articleDeleteErr, articleDeleteRes) {
                    // Set message assertion
                    (articleDeleteRes.body.message).should.match('User is not authorized');

                    // Handle article error error
                    done(articleDeleteErr);
                });

        });
    });

    afterEach(function (done) {
        User.remove().exec(function () {
            Article.remove().exec(done);
        });
    });
})
;
