/** This file creates global mock objects and variables for use across all tests */
    'use strict';

var Raygun;

describe('Karma Globals', function () {
    beforeEach(function () {
        Raygun = {
            init: function () {
                return true
            },
            send: function () {
                return true
            },
            setUser: function () {
                return true
            }
        };
    });

});
