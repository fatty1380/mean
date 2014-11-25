'use strict';

//Bgchecks service used to communicate Bgchecks REST endpoints
var bgCheckFactory = function($resource) {
    return $resource('api/bgchecks/:bgcheckId', {
        bgcheckId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
};

bgCheckFactory.$inject = ['$resource'];

angular.module('bgchecks').factory('Bgchecks', bgCheckFactory);
