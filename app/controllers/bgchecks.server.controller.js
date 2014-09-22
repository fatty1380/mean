'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    Bgcheck = mongoose.model('Bgcheck'),
    Client = require('node-rest-client').Client, // TODO : Decide between this
    rest = require('restler'), // TODO: ... and this.
    request = require('request'),
    unirest = require('unirest'),
    _ = require('lodash');

var client = new Client();

var api_base_url = 'https://renovo-api-test.everifile.com/renovo';
var username = 'api@dswheels.com';
var password = 'Test#123';

// Lets try 'request'!
var login_request = function(req, res) {
    var options = {
        url: 'https://api.github.com/repos/mikeal/request',
        headers: {
            'User-Agent': 'request'
        }
    };
};


// Setup Client Methods (node-rest-client)
client.registerMethod('openSession', api_base_url + '/rest/session', 'POST');
client.registerMethod('getAllApplicants', api_base_url + '/rest/applicants', 'GET');
client.registerMethod('getApplicant', api_base_url + '/rest/applicants/${id}', 'GET');

// Setup Service Methods (restler)
var EVerifileClient = rest.service(function(u, p) {
    this.defaults.username = u;
    this.defaults.password = p;
}, {
    baseURL: api_base_url
}, {
    login: function() {
        var post_data = {
            'username': this.defaults.username,
            'password': this.defaults.password
        };
        var login_path = '/renovo/rest/session';

        return this.json('POST', login_path, post_data);
    },
    getAllApplicants: function() {
        if (!!this.customHeaders) {
            console.log('Getting Applicant list with headers: %o', this.customHeaders);
        }
        if (!this.customHeaders) {
            console.log('Please login first');
        }
        return this.get('/renovo/rest/applicant', {
            headers: this.customHeaders
        });
    },
    getApplicant: function(id) {
        if (!!this.customHeaders) {
            console.log('Getting Applicant %d, with headers: %o', id, this.customHeaders);
        }

        return this.get('/renovo/rest/applicant/' + id, {
            headers: this.customHeaders
        });
    },

    setCookie: function(headers) {
        console.log('setting cookies based on headers: ', headers);

        var set_cookies = headers['set-cookie'];

        var cookies = [];

        for (var i = 0; i < set_cookies.length; i++) {
            var cookie = set_cookies[i];
            console.log('adding cookie ', cookie);
            cookies.push({
                'Cookie': cookie
            });
        }

        this.customHeaders = headers;
    }
});

var eVerifile = new EVerifileClient(username, password);

var CookieJar = unirest.jar(true);

var login_unirest = function(req, res) {

    var post_data = {
        'username': username,
        'password': password
    };

    unirest.post(api_base_url + '/rest/session')
        .type('json')
        .send(post_data)
        .jar(CookieJar)
        .end(function(response) {
            debugger;
            console.log(response.body);

            res.jsonp(response.body);
        });
};

var getApplicants_unirest = function(req, res) {
    unirest.get(api_base_url + '/rest/applicant')
        .jar(CookieJar)
        .end(function(response) {
            debugger;
            console.log(response.body);

            res.jsonp(response.body);
        });
};

var getApplicants_restler = function(req, res) {
    eVerifile.getAllApplicants()
        .on('complete', function(data, response) {
            if (typeof(data) === 'string') {
                console.error('Get All Applicants failed with HTML');
                return res.status(400).send(data);
            } else if (data.e) {
                console.error('Get All Applicants Failed: ', data);
                return res.status(400).send({
                    message: errorHandler.getDataErrorMessage(data)
                });
            } else {
                console.log('[getAllApplicants] data: "' + data + '"');

                if (data.length > 0) {
                    res.jsonp(data);
                } else {
                    res.jsonp({
                        message: 'missing data response',
                        'response': JSON.stringify(response, errorHandler.censor(response))
                    });
                }
            }

        })
        .on('fail', function(data, response) {
            console.log('[getAllApplicants] Response "FAIL" Callback: \n', data);

            return res.status(400).send(data);
        })
        .on('error', function(err, response) {
            console.error('[getAllApplicants] error: ', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
};

var getApplicants_node_rest_client = function(req, res) {
    client.methods.getAllApplicants(function(data, response) {
        if (data.e) {
            console.error('Get All Applicants Failed: ', data);
            return res.status(400).send({
                message: errorHandler.getDataErrorMessage(data)
            });
        } else {
            console.log('[getAllApplicants] response: ', response);
            console.log('[getAllApplicants] data: "' + data + '"'); //

            if (data.length > 0) {
                res.jsonp(data);
            } else {
                res.jsonp({
                    message: 'missing data response',
                    'response': JSON.stringify(response, errorHandler.censor(response))
                });
            }
        }

    }).on('error', function(err) {
        console.error('[getAllApplicants] error: ', err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
}

var login_restler = function(req, res) {

    eVerifile.login()
        .on('complete', function(data, response) {
            console.log('[Login] Response "COMPLETE" Callback: \n', data);

            var responseUsername = (data.username || '').toLowerCase();

            if (typeof(data) === 'string') {
                console.error('Get All Applicants failed with HTML');
                return res.status(400).send(data);
            } else if (data.e) {
                console.error('Login Failed: ', data);
                return res.status(400).send({
                    message: errorHandler.getDataErrorMessage(data),
                    error: data.e
                });
            } else if (responseUsername.length > 0) {
                console.log('Successful Login for user ', responseUsername);

                eVerifile.setCookie(response.headers);

                res.jsonp(data);
            }

        })
        .on('fail', function(data, response) {
            console.log('[Login] Response "FAIL" Callback: \n', data);

            return res.status(400).send({
                message: errorHandler.getDataErrorMessage(data),
                error: data.e
            });
        })
        .on('error', function(err, response) {
            console.error('[Login] Response "ERROR" Callback: ', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
};

var login_node_rest_client = function(req, res) {

    var args = {
        data: {
            'username': username,
            'password': password
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log('Posting w/ args: ', args);

    client.methods.openSession(args, function(data, response) {
        console.log('Response "Complete" Callback');

        var responseUsername = (data.username || '').toLowerCase();

        if (data.e) {
            console.error('Login Failed: ', data);
            return res.status(400).send({
                message: errorHandler.getDataErrorMessage(data)
            });
        } else {
            debugger;
            console.log('Successful Login for user ', responseUsername);
            res.jsonp(data);
        }

    })
        .on('error', function(err) {
            console.error('[Login] error: ', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
};

exports.getAllApplicants = function(req, res) {
    // return getApplicants_node_rest_client(req, res);
    // return getApplicants_restler(req, res);
    return getApplicants_unirest(req, res);

};


exports.login = function(req, res) {
    //return login_restler(req, res);
    //return login_node_rest_client(req, res);
    return login_unirest(req, res);
    //return login_request(req, res);
};

exports.getApplicant = function(req, res, next, _id) {
    var id = _id || req.query.applicantId || 54;

    eVerifile.getApplicant(id)
        .on('complete', function(data, response) {
            if (data.e) {
                console.error('Get Applicant Failed: ', data);

                return next(new Error('Failed to load Applicant ' + id));
            } else {
                console.log('[getApplicant] data: ', data);
                req.applicant = data;
                next();
            }

        }).on('error', function(err) {
            console.error('[getApplicant] error: ', err);
            return next(err);

            //        res.status(400).send({
            //            message: errorHandler.getErrorMessage(err)
            //        });
        });
};


exports.getApplicant_node_rest_client = function(req, res, next, _id) {

    var id = _id || req.query.applicantId || 54;

    var args = {
        path: {
            'id': id
        }
    };

    client.methods.getApplicant(args, function(data, response) {
        if (data.e) {
            console.error('Get Applicant Failed: ', data);

            return next(new Error('Failed to load Applicant ' + id));
        } else {
            console.log('[getApplicant] data: ', data);
            req.applicant = data;
            next();
        }

    }).on('error', function(err) {
        console.error('[getApplicant] error: ', err);
        return next(err);

        //        res.status(400).send({
        //            message: errorHandler.getErrorMessage(err)
        //        });
    });
};
/**
 * Create a Bgcheck
 */
exports.create = function(req, res) {
    var bgcheck = new Bgcheck(req.body);
    bgcheck.user = req.user;

    bgcheck.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
};

/**
 * Show the current Bgcheck
 */
exports.read = function(req, res) {
    res.jsonp(req.bgcheck);
};

/**
 * Update a Bgcheck
 */
exports.update = function(req, res) {
    var bgcheck = req.bgcheck;

    bgcheck = _.extend(bgcheck, req.body);

    bgcheck.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
};

/**
 * Delete an Bgcheck
 */
exports.delete = function(req, res) {
    var bgcheck = req.bgcheck;

    bgcheck.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
};

/**
 * List of Bgchecks
 */
exports.list = function(req, res) {
    Bgcheck.find().sort('-created').populate('user', 'displayName').exec(function(err, bgchecks) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgchecks);
        }
    });
};

/**
 * Bgcheck middleware
 */
exports.bgcheckByID = function(req, res, next, id) {
    Bgcheck.findById(id).populate('user', 'displayName').exec(function(err, bgcheck) {
        if (err) return next(err);
        if (!bgcheck) return next(new Error('Failed to load Bgcheck ' + id));
        req.bgcheck = bgcheck;
        next();
    });
};

/**
 * Bgcheck authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.bgcheck.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
