/** This file creates global mock objects and variables for use across all tests */
    'use strict';

var Raygun;

before(function() {
    console.log('------------- Initializing Karma Global Variables ------------')
    Raygun = {
        init: function() { return true },
        send: function() { return true },
        setUser: function() { return true }
    };
})
