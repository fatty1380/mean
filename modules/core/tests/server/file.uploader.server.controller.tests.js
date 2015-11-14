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
	
// ** CONTROLLER TEST IMPORTS ** //
var Uploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller'))

var supertest = require('supertest-as-promised')(Q.Promise);

_.isUndefined(supertest).should.not.be.true;

//require('supertest-as-promised')(supertest);

/**
 * Globals
 */

var _test, endpoint;

var contentStubs = {
	pngDoc: './Resources/mocks/employer/images/drug-test.png',
	jpgImg: '/Users/patf/Outset/Source/Resources/mocks/employer/images/profile-chad.jpg',
	pdfDoc: '',
	base64: stubs.profileImage64
};

var tester = { property: 'shenanigans' };

describe.only('S3 File Access Tests', function () {
	before(function () {
		log.trace({ func: 'beforeAll' }, 'Setup Base');

		tester.should.have.property('property', 'shenanigans');

		return Q.when(true);
	});

	beforeEach(function () {
		_test = this.currentTest;
		log.trace({ func: this.test.title, test: _test.title }, 'Setup');

		// Save a user to the test db and create new Feed
		//return Q.all([user.save(), feed.save()]).then(
		return Q.when(true);
	});

	it('should allow me to upload a file to s3');

	describe('Base64 Content', function () {
		var content;

		beforeEach(function () {
			content = contentStubs.base64;
		});

		it('should allow me to upload', function () {
			return Uploader.saveContentToCloud({ content: content, isSecure: false })
				.then(function success(result) {

					log.error({
						noName: /undefined$/.test(result.key),
						test: _test.title,
						result: result
					}, 'Result');

					should.exist(result);

					result.should.have.property('key');
					result.should.have.property('bucket');
					result.should.have.property('url');
					result.should.have.property('timestamp');
					result.should.not.have.property('expires');

					result.url.should.match(/^https/i);

					/undefined$/.test(result.key).should.not.be.true;

					result.key.should.not.match(/undefined$/);
					
					return supertest(result.url).get('').expect(200);
				});
		});

		it('should allow me to upload a secure document', function () {
			return Uploader.saveContentToCloud({ content: content, isSecure: true })
				.then(function success(result) {

					log.error({
						noName: /undefined$/.test(result.key),
						test: _test.title,
						result: result
					}, 'Result');

					should.exist(result);

					result.should.have.property('key');
					result.should.have.property('bucket');
					result.should.have.property('url');
					result.should.have.property('timestamp');
					result.should.have.property('expires');

					/undefined$/.test(result.key).should.not.be.true;

					result.key.should.not.match(/undefined$/);

					result.url.should.match(/AWSAccessKeyId=/i);
					result.url.should.match(/Expires=/i);
					result.url.should.match(/Signature=/i);

					return Q.all([
						supertest(result.url).get('').expect(200),
						supertest(result.url.split('?')[0]).get('').expect(403)
					]);
				});
		});
		it('should allow me to access via URL');
		it('should respect the privacy flag');

	});

	afterEach(function () {
		log.trace({ func: this.test.title, test: _test.title }, 'Teardown');

		return Q.when(true);
	});


	after(function () {
		log.trace({ func: 'afterAll' }, 'All Tests Complete');

		return Q.when(true);
	});
});  