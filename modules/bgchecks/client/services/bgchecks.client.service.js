(function () {
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

    var reportFactory = function ($resource, $q, $state, $log, DocAccess) {
        var _this = this;

        function validateAccess(application, driver, file) {

            var deferred = $q.defer();

            var isConnected = !!application.isConnected && !!application.connection && application.connection.isValid;

            if (!isConnected) {
                deferred.reject('Sorry, but you are not connected to this applicant');
            }

            if (!driver) {
                deferred.reject('Sorry, but the applicant\'s profile is not currently available');
            }

            if (!file) {
                deferred.reject('Sorry, but that report is not available');
            }

            return true;
        }

        _this.data = {
            Types: $resource('api/reports/types', {}, {
                list: {
                    method: 'GET',
                    isArray: true
                }
            }),
            get: function (sku) {
                var retVal = $resource('api/reports/types/:sku', {
                    sku: '@sku'
                });

                return retVal.get({ sku: sku }).$promise;
            },
            openReport: function (application, driver, file) {

                return DocAccess.getDriver(driver._id, application).then(
                    function (driverResponse) {
                        if (!!driverResponse) {
                            $state.go('drivers.documents', { driverId: driver._id, documentId: file.sku || 'resume' });
                            return $q.when('Routing to the document');
                        }

                        return $q.reject('Unable to route to Driver\'s Documents');
                    }
                    ).catch(
                        function (error) {
                            $log.warn('[ReportFactory.openReport] %s', error);
                            return $q.reject(error);
                        }
                        );

            }
        };

        return _this.data;
    };

    var applicantFactory = function ($resource) {
        var _this = this;

        var RSRC = $resource('api/users/:userId/driver/applicant',
            {
                userId: '@userId',
                //reportSource: '@reportSource'
            }, {
                get: {
                    method: 'GET',
                    isArray: false
                }
            });

        _this.data = {
            ByUser: RSRC,
            FromForm: function (data, userId) {
                return new RSRC({ userId: userId, reportSource: data });
            },
            getByUser: function (userId) {
                return RSRC.get({ 'userId': userId }).$promise;
            },
            getRemoteData: function (applicantId) {
                var rsrc = $resource('api/reports/applicants/:applicantId/remoteData', {
                    applicantId: '@_id'
                });

                return rsrc.get({applicantId: applicantId}).$promise
                    .then(
                        function success(response) {
                            return response;
                        })
                    .catch(
                        function fail(err) {
                            debugger;
                            return {};
                        });
            },
            ListAll: function (query) {
                var retVal = $resource('api/reports/applicants');

                return retVal.query().$promise;
            },
            get: function (query) {
                var retVal = $resource('api/reports/applicants/:applicantId', {
                    applicantId: '@applicantId'
                });

                return retVal.get(query);
            }
        };

        return _this.data;
    };

    bgCheckFactory.$inject = ['$resource'];
    reportFactory.$inject = ['$resource', '$q', '$state', '$log', 'DocAccess'];

    angular.module('bgchecks')
        .factory('Reports', reportFactory)
        .factory('Bgchecks', bgCheckFactory)
        .factory('Applicants', applicantFactory);


})();
