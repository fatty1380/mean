(function () {
    'use strict';

    var GatewayService = function (Authentication, Profiles, Drivers, Jobs, Companies, Reports, Applicants, Applications, $state, $log, $q) {

        var _this = this;
        var promises = {};
        var model = {};

        _this._data = {
            initialize: function (job, user) {
                if (_this.initialized) {
                    $log.warn('Gateway Service was previously initialized with job `%s`', model.job && model.job._id);
                    debugger;
                    model = {};
                    promises = {};
                }

                if (!!user) {
                    _this._data.user = user;
                }
                _this._data.job = job;

                return $q.when(_this.initialized = true);
            },
            models: model
        };


        /*************************************************************************
         *  Object Properties
         *************************************************************************/

        Object.defineProperty(_this._data, 'user', {
            enumerable: true,
            get: function () {
                if (!promises.user && !!Authentication.user) {
                    promises.user = $q.defer();
                    $log.debug('[gw.user.get] Init User');
                    _this._data.user = Authentication.user;
                }
                return (promises.user = promises.user || $q.defer()).promise;
            },
            set: function (val) {
                $log.debug('[Gateway] Setting `User` to %o', val);
                promises.user = promises.user || $q.defer();
                return (!!val && _.isString(val) ? Profiles.get(val) : $q.when(val))
                    .then(function (userResponse) {
                        promises.user.resolve(userResponse);

                        return (model.user = userResponse);
                    })
                    .then(function (user) {
                        _this._data.driver = _.isEmpty(user) ? null : user.driver;
                    });
            }
        });

        Object.defineProperty(_this._data, 'driver', {
            enumerable: true,
            get: function () {
                if (!promises.user && !!Authentication.user) {
                    $log.debug('[Gateway] Initializing Load of Driver - Initializing User');
                    $log.debug('[gw.driver.get] Init User');
                    _this._data.user = Authentication.user;
                }
                return (promises.driver = promises.driver || $q.defer()).promise;
            },
            set: function (val) {
                $log.debug('[Gateway] Setting `Driver` to %o', val);

                promises.driver = promises.driver || $q.defer();
                return (!!val && _.isString(val) ? Drivers.get(val) : $q.when(val))
                    .then(function (driverResponse) {
                        model.driver = driverResponse;
                        promises.driver.resolve(driverResponse);
                    }
                );
            }
        });

        Object.defineProperty(_this._data, 'job', {
            enumerable: true,
            get: function () {
                if (!promises.job) {
                    $log.debug('[Gateway] Initializing Load of Job');
                }
                return (promises.job = promises.job || $q.defer()).promise;
            },
            set: function (val) {
                $log.debug('[Gateway] Setting `Job` to %o', val);

                promises.job = promises.job || $q.defer();
                (!!val && _.isString(val) ? Jobs.get(val) : $q.when(val))
                    .then(function (jobResponse) {
                        model.job = jobResponse;
                        promises.job.resolve(jobResponse);
                        return jobResponse;
                    })
                    .then(function (job) {
                        _this._data.company = job.company;
                    });
            }
        });

        Object.defineProperty(_this._data, 'company', {
            enumerable: true,
            get: function () {
                if (!promises.company) {
                    promises.company = $q.defer();
                    $log.debug('[Gateway] Initializing Load of Company');
                }
                return promises.company.promise;
            },
            set: function (val) {
                $log.debug('[Gateway] Setting `Company` to %o', val);

                promises.company = promises.company || $q.defer();
                (!!val && _.isString(val) ? Companies.get(val) : $q.when(val))
                    .then(function (companyResponse) {
                        model.company = companyResponse;
                        promises.company.resolve(companyResponse);
                        return companyResponse;
                    });
            }
        });

        Object.defineProperty(_this._data, 'applicantGateway', {
            get: function () {
                if (!promises.applicantGateway) {
                    $log.debug('[Gateway] Initializing Load of Applicant Gateway Settings');
                    loadGateway().then(function (response) {
                        $log.debug('[Gateway] Loaded gateway with value: %j', response);
                    });
                }
                return promises.applicantGateway.promise;
            },
            set: function (val) {
                $log.debug('[Gateway] Initializing Value of Applicant Gateway Settings');

                promises.applicantGateway = (promises.applicantGateway || $q.defer());
                $q.when(val)
                    .then(function (gatewayResponse) {
                        $log.debug('[Gateway] Resolving applicantGateway with %o', gatewayResponse);
                        model.applicantGateway = gatewayResponse;
                        promises.applicantGateway.resolve(gatewayResponse);
                        return gatewayResponse;
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
                if (!promises.report) {
                    $log.debug('[Gateway] Initializing Load of Report Definition');
                }
                return (promises.report = promises.report || $q.defer()).promise;
            },
            set: function (val) {
                $log.debug('[Gateway] Setting `Report Definition` to %o', val);

                promises.report = $q.defer();
                if (model.sku !== val) {
                    _this._data.user
                        .then(function (userResponse) {
                            $log.debug('[Gateway] User loaded, now retrieving Report Definition info');
                            return (!!val && _.isString(val) ? Reports.get(val) : $q.when(val));
                        })
                        .then(function (reportResponse) {
                            model.report = reportResponse;
                            promises.report.resolve(reportResponse);
                            return reportResponse;
                        })
                        .then(function (report) {
                            model.sku = (report || {}).sku;
                        });

                }
            }
        });

        Object.defineProperty(_this._data, 'applicant', {
            enumerable: true,
            get: function () {
                if (!promises.applicant) {
                    loadApplicant().then(
                        function (applicant) {
                            if (!!applicant) {
                                $log.debug('[Gateway] Finished loading applicant');
                            }
                        }
                    );
                }

                return (promises.applicant = promises.applicant || $q.defer()).promise;
            },
            set: function (val) {
                $log.debug('[Gateway] Setting `Remote Applicant` to %o', val);

                promises.applicant = $q.when(val);
            }
        });

        Object.defineProperty(_this._data, 'application', {
            enumerable: true,
            get: function () {
                if (!promises.application) {
                    $log.debug('[Gateway] Initializing Load of Job Application');

                    promises.application = $q.defer();
                    $q.all({job: _this._data.job, user: _this._data.user})
                        .then(function (values) {
                            Jobs.getApplication(values.job._id, values.user._id)
                                .then(function (applicationResponse) {
                                    $log.debug('[Gateway] Loaded Application');
                                    model.application = applicationResponse;

                                    promises.application.resolve(model.application);
                                })
                                .catch(function (err) {
                                    $log.debug('[Gateway] Failed to load Application', err);
                                    model.application = {
                                        releases: []
                                    };

                                    _this._data.job.then(function (jobResponse) {
                                        model.application.jobId = jobResponse._id;
                                    });
                                    _this._data.user.then(function (userResponse) {
                                        model.application.userId = userResponse._id;
                                    });

                                    promises.application.resolve(model.application);
                                });
                        });
                }

                return promises.application.promise;
            },
            set: function (val) {
                $log.debug('[Gateway] Setting `Application` to %o', val);

                promises.application = $q.defer();

                (!!val && _.isString(val) ? Applications.ById(val) : $q.when(val))
                    .then(function (applicationResponse) {
                        model.application = applicationResponse;
                        promises.application.resolve(applicationResponse);
                        return applicationResponse;
                    });
            }
        });

        Object.defineProperty(_this._data, 'releases', {
            enumerable: true,
            get: function () {
                return _this._data.application
                    .then(function (application) {
                        return application.releases;
                    });
            },
            set: function (val) {
                $log.debug('[Gateway] Setting `Release` to %o', val);

                _this._data.application
                    .then(function (application) {
                        application.releases = val;
                    });
            }
        });

        /*************************************************************************
         *  Private Methods
         *************************************************************************/

        function loadApplicant() {
            if (!promises.applicant) {
                $log.debug('[Gateway] Initializing Load of Remote Applicant');

                promises.applicant = $q.defer();

                return _this._data.user
                    .then(function (user) {
                        return Applicants.getByUser(user.id);
                    })
                    .then(function (applicant) {
                        $log.debug('[Gateway] Resolving Applicant as %o', applicant);
                        promises.applicant.resolve(applicant);
                    })
                    .catch(function (err) {
                        $log.debug('[Gateway] No existing applicant: %s', err);
                        promises.applicant.resolve({});
                    });
            }
            return $q.reject('Applicant already loading');
        }

        function loadGateway() {
            if (!promises.applicantGateway) {

                promises.applicantGateway = $q.defer();

                return $q.all({co: _this._data.company, job: _this._data.job}).then(
                    function (values) {
                        var gw = values.job && values.job.gateway || values.co && values.co.gateway || {
                                sku: 'OUTSET_MVR',
                                required: true,
                                payment: 'company',
                                releaseType: 'preEmployment'
                            };

                        _this._data.applicantGateway = gw;

                        return gw;
                    });
            }
            return $q.reject('Applicant already loading');


        }

        return _this._data;
    };

    GatewayService.$inject = ['Authentication', 'Profiles', 'Drivers', 'Jobs', 'Companies', 'Reports', 'Applicants', 'Applications', '$state', '$log', '$q'];

    angular.module('applications')
        .service('Gateway', GatewayService);
})
();
