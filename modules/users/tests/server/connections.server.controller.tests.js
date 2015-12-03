'use strict';

var should = require('should'),
	_ = require('lodash'),
	Q = require('q'),
	path = require('path'),
	stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'file.uploader'
    });

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	BranchData = mongoose.model('BranchData'),
	RequestMessage = mongoose.model('RequestMessage');
	
// ** CONTROLLER TEST IMPORTS ** //
var CnxnCtrl = require(path.resolve('./modules/users/server/controllers/users/users.connections.server.controller'));

//require('supertest-as-promised')(supertest);

/**
 * Globals
 */

var inviter, user;

var _test;

describe('User Connection Tests', function () {
	before(function () {
		log.trace({ func: 'beforeAll' }, 'Setup Base');

		inviter = new User(stubs.user);
		user = new User(stubs.getUser());

		return Q.all([
			inviter.save()
		]);
	});

	var bd, requestMessage;

	beforeEach(function () {
		_test = this.currentTest;
		log.trace({ func: this.test.title, test: _test.title }, 'Setup');

		requestMessage = new RequestMessage(rmStub);
		requestMessage.from = inviter._id;

		bd = new BranchData(bdStub);
		bd.user = user._id;
		bd.data.requestUserId = inviter.id;
		bd.data.requestId = requestMessage._id;

		return Q.all([bd.save(), requestMessage.save()]);
	});

	it('should connect the new Branch Data with the Existing Friend Request', function () {

		return CnxnCtrl.updateOutstandingRequests(user, bd)
			.then(
				function success(updatedRequests) {
					updatedRequests.should.have.property('length', 1);

					var req = updatedRequests[0];

					log.info({ test: _test.title, func: 'updateOutstandingRequests', result: req }, 'Examining Saved Request');

					req.should.have.property('to', user._id);
					req.should.have.property('status', 'sent');

					return BranchData.findById(bd.id);
				})
			.then(function (bd) {
				log.debug({ test: _test.title, bd: bd }, 'Examining updated BD');
				bd.should.have.property('status', 'processed');
			});

	});

	it('should not connect if the Request has `to` defined', function () {
		requestMessage.to = (new User(stubs.user))._id;

		return requestMessage.save().then(
			function (rm) {
				return CnxnCtrl.updateOutstandingRequests(user, bd);
			})
			.then(
				function success(updatedRequests) {
					updatedRequests.should.have.property('length', 0);


					return BranchData.findById(bd.id);
				})
			.then(function (bd) {
				log.debug({ test: _test.title, bd: bd }, 'Examining updated BD');
				bd.should.have.property('status', 'notFound');
			});
	});

	afterEach(function () {
		log.trace({ func: this.test.title, test: _test.title }, 'Teardown');

		stubs.cleanTables([BranchData, RequestMessage]);

		return Q.when(true);
	});


	after(function () {
		log.trace({ func: 'afterAll' }, 'All Tests Complete');

		stubs.cleanTables([User]);
		return Q.when(true);
	});
});



var bdStub = {
    "user": null,
    "status": "new",
    "referralCode": null,
    "data": {
        "clicked_branch_link": true,
        "is_first_session": false,
        "click_timestamp": 1447489667,
        "referrer": "https://bnc.lt/quick-redirect-to-deepview?final_url=https%3A%2F%2Fbnc.lt%2Fl%2F8lAlAMkA6m",
        "match_guaranteed": true,
        "id": "193992416066322994",
        "feature": "inviteRequest:new",
        "creation_source": "API",
        "channel": "sms",
        "one_time_use": false,
        "shortId": "NJ8O1yeXe",
        "requestUserId": "56450f83b9203e0a07f8c608",
        "requestId": null,
        "already_fired_uri": "1"
    },
    "__v": 0
};

var rmStub = {
    "from": null,
    "contactInfo": {
        "phoneNumbers": [
            {
                "order": 1,
                "value": "6507767675"
            }
        ],
        "phone": "6507767675"
    },
    "text": "",
    "requestType": "friendRequest",
    "status": "sent",
    "to": null,
    "shortId": "NJ8O1yeXe",
    "__v": 0,
    "objectLink": "https://bnc.lt/l/8lAlAMkA6m"
};