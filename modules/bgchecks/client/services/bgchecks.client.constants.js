'use strict';

var stubs = {
    applicantList: [{
        'lastName': 'Smith',
        'applicantId': 1000000,
        'governmentId': '201211141',
        'birthDate': 260427600000,
        'firstName': 'Bob'
    }, {
        'lastName': 'Smith',
        'applicantId': 13,
        'governmentId': null,
        'birthDate': 1360902394000,
        'firstName': 'Albert'
    }],

    applicant: {
        'firstName': 'Bob',
        'middleName': 'Norman',
        'lastName': 'Smith',
        'nameSuffix': 'MD',
        'applicantId': 1000000,
        'aliases': [{
            'middleName': null,
            'lastName': 'McDonald',
            'firstName': 'Ronald'
        }],
        'currentAddress': {
            'street2': 'Suite 200',
            'street1': '101 Oak Street',
            'postalCode': '30302',
            'state': 'georgia',
            'province': null,
            'country': 'united_states',
            'city': 'Atlanta'
        },
        'governmentId': '201211141',
        'gender': 'Male',
        'birthDate': 260427600000
    }
};

angular.module('bgchecks').constant('StubValues', stubs);
