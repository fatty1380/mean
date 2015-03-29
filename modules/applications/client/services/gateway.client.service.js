(function () {
    'use strict';

    var GatewayService = function (Authentication, Profiles, Drivers, Jobs, Companies, Reports, Applicants, $state, $log, $q) {

        var _this = this;
        var model = {};

        _this._data = {
            initialize: function (job) {
                if (_this.initialized) {
                    $log.warn('Gateway Service is already initialized');
                    return false;
                }

                _this._data.user = Authentication.user;
                _this._data.job = job;
            },
        };


        /*************************************************************************
         *  Object Properties
         *************************************************************************/

        Object.defineProperty(_this._data, 'user', {
            enumerable: true,
            get: function () {
                return (model.user = model.user || $q.defer()).promise;
            },
            set: function (val) {
                model.user = model.user || $q.defer();
                return (!!val && _.isString(val) ? Profiles.get(val) : $q.when(val))
                    .then(function (userResponse) {
                        model.user.resolve(userResponse);

                        return userResponse;
                    })
                    .then(function (user) {
                        _this._data.driver = _.isEmpty(user) ? null : user.driver;
                    });
            }
        });

        Object.defineProperty(_this._data, 'driver', {
            enumerable: true,
            get: function () {
                return (model.driver = model.driver || $q.defer()).promise;
            },
            set: function (val) {
                model.driver = model.driver || $q.defer();
                return (!!val && _.isString(val) ? Drivers.get(val) : $q.when(val))
                    .then(function (driver) {
                        model.driver.resolve(driver);
                        return driver;
                    }
                );
            }
        });

        Object.defineProperty(_this._data, 'job', {
            enumerable: true,
            get: function () {
                return (model.job = model.job || $q.defer()).promise;
            },
            set: function (val) {
                model.job = model.job || $q.defer();
                return (!!val && _.isString(val) ? Jobs.get(val) : $q.when(val))
                    .then(function (jobResponse) {
                        model.job.resolve(jobResponse);
                        return jobResponse;
                    })
                    .then(function(job) {
                        _this._data.company = job.company;
                    });
            }
        });

        Object.defineProperty(_this._data, 'company', {
            enumerable: true,
            get: function () {
                return (model.company = model.company || $q.defer()).promise;
            },
            set: function (val) {
                model.company = model.company || $q.defer();
                return (!!val && _.isString(val) ? Companies.get(val) : $q.when(val))
                    .then(function (companyResponse) {
                        model.company.resolve(companyResponse);
                        return companyResponse;
                    })
                    .then(function () {
                        loadGateway();
                    });
            }
        });

        Object.defineProperty(_this._data, 'applicantGateway', {
            get: function () {
                return (model.gateway = model.gateway || $q.defer()).promise;
            },
            set: function (val) {
                model.gateway = model.gateway || $q.defer();
                $q.when(val)
                    .then(function (gateway) {
                        model.gateway.resolve(gateway);
                        return gateway;
                    })
                    .then(function (gateway) {
                        var newSku = gateway && gateway.sku || null;

                        _this._data.report = newSku;
                    });
            }
        });

        Object.defineProperty(_this._data, 'report', {
            enumerable: true,
            get: function () {
                return (model.report = model.report || $q.defer()).promise;
            },
            set: function (val) {
                model.report = model.report || $q.defer();
                if (model.sku !== val) {
                    return (!!val && _.isString(val) ? Reports.get(val) : $q.when(val))
                        .then(function (reportResponse) {
                            model.report.resolve(reportResponse);
                            return reportResponse;
                        })
                        .then(function (report) {
                            model.sku = (report || {}).sku;
                        });
                }
            }
        });

        function loadApplicant() {
            if (!model.applicant) {
                $log.debug('[Gateway] Looking up Applicant');

                model.applicant = $q.defer();

                return _this._data.user
                    .then(function (user) {
                        return Applicants.getByUser(user.id);
                    })
                    .then(function (applicant) {
                        $log.debug('[Gateway] Resolving Applicant as %o', applicant);
                        model.applicant.resolve(applicant);
                    })
                    .catch(function(err) {
                        $log.debug('[Gateway] No existing applicant: %s', err);
                        model.applicant.resolve({});
                    });
            }
            return $q.reject('Applicant already loading');
        }

        var loadingApplicant = false;

        Object.defineProperty(_this._data, 'applicant', {
            enumerable: true,
            get: function () {
                if (!model.applicant) {
                    loadApplicant().then(
                        function (applicant) {
                            if (!!applicant) {
                                $log.debug('[Gateway] Finished loading applicant');
                            }
                        }
                    );
                }

                return (model.applicant = model.applicant || $q.defer()).promise;
            },
            set: function (val) {
                model.applicant = $q.when(val);
            }
        });

        Object.defineProperty(_this._data, 'signature', {
            enumerable: true,
            get: function() {
                return _this._data.applicant
                    .then(function(applicant) {
                        return applicant.signature;
                    });
            },
            set: function(val) {
                _this.data.applicant
                .then(function(applicant) {
                        applicant.signature = val;
                    });
            }
        });

        /*************************************************************************
         *  Private Methods
         *************************************************************************/

        function loadDriver(user) {
            var driverFn, driver = !!user && user.driver;

            if (!!driver && _.isString(driver)) {
                $log.debug('[GatewaySvc] Loading driver `%s`', driver);
                driverFn = Drivers.get(driver);
            } else if (!!user.id) {
                $log.debug('[GatewaySvc] Loading driver for user `%s`', user.id);
                driverFn = Drivers.getByUser(user.id);
            } else {
                $log.debug('[GatewaySvc] No data available to load driver');
                return;
            }

            driverFn
                .then(function (driverResponse) {
                    $log.debug('[GatewayCtrl] Loaded Driver object');
                    return (_this._data.driver = driverResponse);
                })
                .catch(function (err) {
                    debugger;
                    $log.debug('[GatewayCtrl] Err getting driver for id `%s`: %s', driver, err);
                    return Drivers.default;
                });
        }

        function loadGateway() {

            $q.all({co: _this._data.company, job: _this._data.job}).then(
                function(values) {
                    var gw = values.job && values.job.gateway || values.co && values.co.gateway || null;

                    _this._data.applicantGateway = gw || {
                        sku: 'OUTSET_MVR',
                        required: true,
                        payment: 'company'
                    };
                });

            $log.warn('[Gateway] Setting default gateway');
            _this._data.applicantGateway = {
                sku: 'OUTSET_MVR',
                required: true,
                payment: 'company'
            };


        }

        return _this._data;
    };

    GatewayService.$inject = ['Authentication', 'Profiles', 'Drivers', 'Jobs', 'Companies', 'Reports', 'Applicants', '$state', '$log', '$q'];

    angular.module('applications')
        .service('Gateway', GatewayService);
})();
