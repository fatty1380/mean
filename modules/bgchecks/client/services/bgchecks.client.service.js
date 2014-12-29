'use strict';

//Bgchecks service used to communicate Bgchecks REST endpoints
var bgCheckFactory = function ($resource) {
    return $resource('api/bgchecks/:bgcheckId', {
        bgcheckId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
};

var reportFactory = function ($resource) {
    var _this = this;

    _this.data = {
        Types: $resource('/api/reports/types', {}, {
            list: {
                method: 'GET',
                isArray: true
            }
        }),
        get: function (sku) {
            var retVal = $resource('/api/reports/types/:sku', {
                sku: '@sku'
            });

            return retVal.get({sku: sku});
        }
    };

    return _this.data;
};

var applicantFactory = function ($resource) {
    var _this = this;

    _this.data = {
        ByUser: $resource('/api/users/:userId/driver/applicant', {
            userId: '@userId',
            reportSource: '@reportSource'
        }),
        ListAll: function (query) {
            var retVal = $resource('/api/reports/applicants');

            return retVal.query();
        },
        get: function (query) {
            var retVal = $resource('/api/reports/applicants/:applicantId', {
                applicantId: '@applicantId'
            });

            return retVal.get(query);
        }
    };

    return _this.data;
};

bgCheckFactory.$inject = ['$resource'];

angular.module('bgchecks')
    .factory('Reports', reportFactory)
    .factory('Bgchecks', bgCheckFactory)
    .factory('Applicants', applicantFactory);
