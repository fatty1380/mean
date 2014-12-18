(function() {
    'use strict';

    var gmapsApiBase = '//maps.googleapis.com/maps/api/js?';

    function gmapApiProvider() {

        // TODO: Use this!

        var config = {
            key: 'AIzaSyDb2fSf75lhB2A0lBXeZ_89iXDhO-pmLoY',
            v: '3.18',
            libraries: 'weather,geometry,visualization'
        };

        var configs = ['v'+config.v, 'key='+config.key, 'libraries='+config.libraries];

        var gmaps = gmapsApiBase + configs.join('&');
    }

    // Location module config
    angular.module('location').config(gmapApiProvider);

})();
