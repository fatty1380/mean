'use strict';

var should = require('should'),
    _ = require('lodash'),
    Q = require('q'),
    rewire = require('rewire'),
    path = require('path'),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'user.test',
        file: 'user.connections.server.controller'
    });
    
var RequestCtrl = rewire(path.resolve('./modules/users/server/controllers/requests.server.controller'));

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    RequestMessage = mongoose.model('RequestMessage');

/**
 * Globals
 */
var app, agent, credentials, user, _test, request;

var normalizeRequest = RequestCtrl.__get__('normalizeRequest');


describe('Request Messages & Social', function () {
    before(function (done) {
        // Get application
        //app = express.init(mongoose).http;
        
        log.debug({ func: 'beforeAll', normalize: !!normalizeRequest }, 'Init');
        
        should.exist(normalizeRequest);
        normalizeRequest.should.be.a.function;

        done();
    });

    beforeEach(function () {
        user = stubs.user;
        
        request = {
            from: user._id,
            contactInfo: {
                checked: true,
                displayName: 'Calamity Jane',
                phoneNumbers: ['2234567890', '2234567891'],
                emails: 'pat@joinoutset.com',
            },
            contents: null,
            status: 'new',
            text: 'hello there!'
        };
    });

    describe('Private Method testing', function () {
       
        it('should convert plain arrays to [value, order] arrays', function () {
                        
            var updatedRequest = normalizeRequest(request);
            
            updatedRequest.should.have.property('contactInfo').and.have.property('phoneNumbers');
            updatedRequest.should.have.property('contactInfo').and.have.property('emails');
            
            var ci = updatedRequest.contactInfo;
            
            ci.phoneNumbers.should.be.Array.with.length(2);
            ci.emails.should.be.Array.with.length(1);
            
            ci.emails[0].should.be.Object.and.have.property('value');
            ci.phoneNumbers[0].should.be.Object.and.have.property('value');
            
            
        });
        it('should remove duplicate numbers and emails', function () {
            
            request.contactInfo.phoneNumbers = ['2345678901', '+12345678901', '+1 (234) 567-8901'];
            request.contactInfo.emails = ['pat@test.com', 'pat@test.com'];
                        
            var updatedRequest = normalizeRequest(request);
            
            updatedRequest.contactInfo.phoneNumbers.should.be.Array.with.length(1);
            updatedRequest.contactInfo.emails.should.be.Array.with.length(1);
        });
        it('should strip non-numeric characters from phone numbers', function () {
            request.contactInfo.phoneNumbers = ['+1 (425) 454-7675'];
            
            var updatedRequest = normalizeRequest(request);
            
            updatedRequest.contactInfo.phoneNumbers.should.have.length(1);
            updatedRequest.contactInfo.phoneNumbers[0].value.should.eql('4254547675');
        });
        it('should strip leading 1 from phone numbers', function () {
            request.contactInfo.phoneNumbers = ['12345678901'];
            
            var updatedRequest = normalizeRequest(request);
            
            updatedRequest.contactInfo.phoneNumbers.should.have.length(1);
            updatedRequest.contactInfo.phoneNumbers[0].value.should.eql('2345678901');
        });
        it('should ignore 8xx numbers', function () {
            request.contactInfo.phoneNumbers = ['8006234567', '8666234567', '8882345678', '8776234567', '8556234567', '8446234567'];
            
            var updatedRequest = normalizeRequest(request);
            
            updatedRequest.contactInfo.phoneNumbers.should.have.length(0);
        });
        it('should sort numbers/emails by priority order');
        it('should set all emails to lower case', function () {
            request.contactInfo.emails = ['PAT@TEST.COM'];
            
            var updatedRequest = normalizeRequest(request);
            
            var email = updatedRequest.contactInfo.emails[0];
            
            log.debug('Got email: ', email.value);
            
            /[A-Z]+/.test(email.value).should.be.false;
        });
        it('should handle data stored in \'phones\' rather than \'phoneNumbers\'', function () {
            
            delete request.contactInfo.phoneNumbers;
            request.contactInfo.phones = ['2345678901'];
                        
            var updatedRequest = normalizeRequest(request);
            
            should.not.exist(request.contactInfo.phones);
            updatedRequest.contactInfo.phoneNumbers.should.be.Array.with.length(1);
        });
        it('should remove _checked_, _phones_ and _status_ and default \'hello there\' text from the object', function () {
            
            delete request.contactInfo.phoneNumbers;
            request.contactInfo.phones = ['2345678901'];
            request.checked = 'true';
            request.status = 'sent';
            request.text = 'hello there!';
                        
            var updatedRequest = normalizeRequest(request);
            
            should.not.exist(request.contactInfo.phones);
            should.not.exist(request.contactInfo.checked);
            should.not.exist(request.contactInfo.status);
            should.not.exist(request.text);
            
        });

    });

    afterEach(function () {
        return stubs.cleanTables([User, RequestMessage]);
    });
});

var contactInfoStubs = [
    {
        "checked": "true",
        "phoneNumbers": [
            "9193945051",
            "9193945051",
            "9193945051"
        ],
        "emails": "",
        "displayName": "Anthony Wells"
    },

];