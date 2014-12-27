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

var reportFactory = function($resource) {
    var _this = this;

    _this.data = {
        Types: $resource('/api/reports', {

        }, {
            list: {
                method: 'GET',
                isArray: true
            }
        }),
        Fields: $resource('/api/reports/:reportSKU', {
            reportSKU: '@reportSKU'
        })
    };

    return _this.data;
};

bgCheckFactory.$inject = ['$resource'];

angular.module('bgchecks')
    .factory('Reports',reportFactory )
    .factory('Bgchecks', bgCheckFactory);
