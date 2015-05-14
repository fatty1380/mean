/** This file creates global mock objects and variables for use across all tests */
    'use strict';

var
    _            = require('lodash');

var stubs = {};

Object.defineProperty(stubs, 'user', {
    get: function() {
        return {
            firstName: 'Terry',
            lastName: 'Test',
            email: 'userDriver@test.com',
            username: 'userDriver',
            password: 'password',
            provider: 'local',
            type: 'driver'
        }
    }
})

Object.defineProperty(stubs, 'owner', {
    get: function() {
        return {
            firstName: 'Owen',
            lastName: 'Owner',
            email: 'userOwner@test.com',
            username: 'userOwner',
            password: 'password',
            provider: 'local',
            type: 'owner'
        }
    }
})

exports.user = stubs.user;
exports.owner = stubs.owner;

exports.users = {
    driver: exports.user,
    owner: stubs.owner
}

exports.credentials = {
    username: '',
    password: 'password'
}

exports.application = {
    introduction : 'Hello, please allow me to introduce myself'
}

exports.getApplication = function(user, company, job) {

    return {
        introduction: exports.application.introduction,
        user: user,
        job: job,
        company: company
    };
}

exports.getUser = function() {
    return _.extend(randomUser(), {type: 'driver'});
}

exports.getOwner = function() {
    return _.extend(randomUser(), {type: 'owner'});
}

function randomUser() {
    var alt =new String(Math.random() * 10000);
    return {
        firstName: 'User',
        lastName: alt,
        email: 'user'+alt+'@test.com',
        username: 'user'+alt+'',
        password: 'password',
        provider: 'local'
    }
}
