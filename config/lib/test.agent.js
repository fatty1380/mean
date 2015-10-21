/** This file creates global mock objects and variables for use across all tests */
'use strict';

var
    _ = require('lodash'),
    Q = require('q'),
    path = require('path'),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    superagent = require('supertest-as-promised')(Q.Promise),
    express = require(path.resolve('./config/lib/express')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'TestAgent'
    });

var mongoose = require('mongoose'),
    ClientApp = mongoose.model('ClientApplication');

var tc = { name: 'TestCase', clientId: 'tc_01', clientSecret: 'shenanigans' };
var cp = ClientApp.findOneAndUpdate(tc, tc, { upsert: true, new: true }).exec()
    .then(
        function (doc) {
            console.info({ func: 'Constructor', doc: doc }, 'Doc Result: ');

            return doc;
        },
        function (err) {
            log.error('Unable to save/upsert Client ID', err);
            return Q.reject(err);
        });

var config = {
    token: {}
};

function TestAgent(db) {
    log.info({ func: 'Constructor', db: db }, 'START');
    var app = express.init(db || mongoose);

    this.agent = superagent.agent(app.http);
    config.token.access_token = '';

    cp.then(function (client) { this.client = client; });
}

TestAgent.prototype.getClient = function () { return this.client; };
TestAgent.prototype.getToken = function () { return config.token; };

TestAgent.prototype.get = function (url) {
    log.trace({ func: 'GET' });
    return this.agent.get(url).use(this.bearer);
};

TestAgent.prototype.post = function (url, body) {
    log.trace({ func: 'POST' });
    return this.agent.post(url).send(body).use(this.bearer);
};

TestAgent.prototype.put = function (url, body) {
    log.trace({ func: 'PUT' });
    return this.agent.put(url).send(body).use(this.bearer);
};

TestAgent.prototype.request = function (method, url) {
    // callback
    if ('function' === typeof url) {
        return new this.agent.Request('GET', method).end(url).use(this.bearer);
    }

    // url first
    if (1 === arguments.length) {
        return new this.agent.Request('GET', method).use(this.bearer);
    }

    return new this.agent.Request(method, url).use(this.bearer);
};

TestAgent.prototype.login = function (credentials, options) {
    var _self = this;
    
    options = options || {};
    var expect = options.expect || 200;
    var rawResponse = options.rawResponse || false;
    
    return cp.then(function (client) {
        log.error({ self: _self, this: this, client: client }, 'Current Client Config');
        _self.client = _self.client || client;

        var endpoint = '/oauth/token';

        var payload = _.extend(credentials, {
            grant_type: 'password',
            client_id: _self.client.clientId,
            client_secret: _self.client.clientSecret
        });
        log.info({ func: 'login', payload: payload }, 'Login Start');

        return _self.agent.post(endpoint)
            .send(payload)
            .expect(expect)
            .then(
                function success(response) {
                    log.info({ func: 'login', body: response.body }, 'Bearer Login Successful');
                    config.token.access_token = response.body && response.body.access_token;
                    
                    if (!!rawResponse) {
                        return response;
                    }
                    
                    return response.body;
                },
                function fail(err) {
                    log.error({ func: 'login' }, 'Unable to login due to error', err);
                    return Q.reject(err);
                });
    });
};

TestAgent.prototype.logout = function () {
    log.trace('Logging out');
    config.token.access_token = null;
    return this.agent.get('/api/auth/signout');
};

TestAgent.prototype.destroy = function () {
    return stubs.cleanTables(['clientapplications', 'accesstokens', 'refreshtokens']);
};

TestAgent.prototype.bearer = function b(request) {
    debugger;
    // "config" is a global var where token and other stuff resides
    if (config.token.access_token) {
        log.trace('Adding Bearer Token');
        request.set('Authorization', 'Bearer ' + config.token.access_token);
    }
    else {
        log.trace({ request: request, this: this, config: config }, 'Not adding Bearer Token');
    }
};

TestAgent.prototype.TestAgent = TestAgent;

module.exports = new TestAgent();
