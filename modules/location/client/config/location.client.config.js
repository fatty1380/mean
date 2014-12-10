(function() {
    'use strict';

    function gmapApiProvider(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyDb2fSf75lhB2A0lBXeZ_89iXDhO-pmLoY',
            v: '3.17',
            libraries: 'weather,geometry,visualization'
        });
    }

    gmapApiProvider.$inject = ['uiGmapGoogleMapApiProvider'];

    // Location module config
    angular.module('location').config(gmapApiProvider);

})();
