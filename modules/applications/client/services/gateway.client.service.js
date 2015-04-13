(function () {
    'use strict';

    var GatewayService = function (Authentication, Profiles, Drivers, Jobs, Companies, Reports, Applicants, Applications, $state, $log, $q) {

        var Gateway;

        Gateway = (function () {
            function Gateway(jobId, user) {
                this.promises = {};
                this.models = {};

                this.initialize = function (job, user) {

                    if (this.initialized) {
                        $log.warn('Gateway Service was previously initialized with job `%s`', this.models.job && this.models.job._id);
                        this.reset();
                    }

                    if (!!user) {
                        this.user = user;
                    }
                    this.job = job;

                    return $q.when(this.initialized = true);
                };

                this.reset = function () {

                    this.initialized = false;
                    this.models = {};
                    this.promises = {};

                    this.initialized = false;
                };

                var self = this;


                /*************************************************************************
                 *  Object Properties
                 *************************************************************************/

                Object.defineProperty(this, 'user', {
                    enumerable: true,
                    get: function () {
                        var _this = this;
                        if (!_this.promises.user && !!Authentication.user) {
                            _this.promises.user = $q.defer();
                            $log.debug('[gw.user.get] Init User');
                            _this.user = Authentication.user;
                        }
                        return (_this.promises.user = _this.promises.user || $q.defer()).promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `User` to %o', val);
                        _this.promises.user = _this.promises.user || $q.defer();
                        return (!!val && _.isString(val) ? Profiles.get(val) : $q.when(val))
                            .then(function (userResponse) {
                                _this.promises.user.resolve(userResponse);

                                return (_this.models.user = userResponse);
                            })
                            .then(function (user) {
                                _this.driver = _.isEmpty(user) ? null : user.driver;
                            });
                    }
                });

                Object.defineProperty(this, 'driver', {
                    enumerable: true,
                    get: function () {
                        var _this = this;
                        if (!_this.promises.user && !!Authentication.user) {
                            $log.debug('[Gateway] Initializing Load of Driver - Initializing User');
                            $log.debug('[gw.driver.get] Init User');
                            _this.user = Authentication.user;
                        }
                        return (_this.promises.driver = _this.promises.driver || $q.defer()).promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `Driver` to %o', val);

                        _this.promises.driver = _this.promises.driver || $q.defer();
                        return (!!val && _.isString(val) ? Drivers.get(val) : $q.when(val))
                            .then(function (driverResponse) {
                                _this.models.driver = driverResponse;
                                _this.promises.driver.resolve(driverResponse);
                            }
                        );
                    }
                });

                Object.defineProperty(this, 'job', {
                    enumerable: true,
                    get: function () {
                        var _this = this;
                        if (!_this.promises.job) {
                            $log.debug('[Gateway] Initializing Load of Job');
                        }
                        return (_this.promises.job = _this.promises.job || $q.defer()).promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `Job` to %o', val);

                        _this.promises.job = _this.promises.job || $q.defer();
                        (!!val && _.isString(val) ? Jobs.get(val) : $q.when(val))
                            .then(function (jobResponse) {
                                _this.models.job = jobResponse;
                                _this.promises.job.resolve(jobResponse);
                                return jobResponse;
                            })
                            .then(function (job) {
                                _this.company = job.company;
                            });
                    }
                });

                Object.defineProperty(this, 'company', {
                    enumerable: true,
                    get: function () {
                        var _this = this;
                        if (!_this.promises.company) {
                            _this.promises.company = $q.defer();
                            $log.debug('[Gateway] Initializing Load of Company');
                        }
                        return _this.promises.company.promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `Company` to %o', val);

                        _this.promises.company = _this.promises.company || $q.defer();
                        (!!val && _.isString(val) ? Companies.get(val) : $q.when(val))
                            .then(function (companyResponse) {
                                _this.models.company = companyResponse;
                                _this.promises.company.resolve(companyResponse);
                                return companyResponse;
                            });
                    }
                });

                Object.defineProperty(this, 'applicantGateway', {
                    get: function () {
                        var _this = this;
                        if (!_this.promises.applicantGateway) {
                            $log.debug('[Gateway] Initializing Load of Applicant Gateway Settings');
                            loadGateway(_this).then(function (response) {
                                $log.debug('[Gateway] Loaded gateway with value: %j', response);
                                _this.applicantGateway = response;
                            });
                        }
                        return _this.promises.applicantGateway.promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Initializing Value of Applicant Gateway Settings');

                        _this.promises.applicantGateway = (_this.promises.applicantGateway || $q.defer());
                        $q.when(val)
                            .then(function (gatewayResponse) {
                                $log.debug('[Gateway] Resolving applicantGateway with %o', gatewayResponse);
                                _this.models.applicantGateway = gatewayResponse;
                                _this.promises.applicantGateway.resolve(gatewayResponse);
                                return gatewayResponse;
                            })
                            .then(function (gateway) {
                                var newSku = gateway && gateway.sku || null;

                                _this.report = newSku;
                            });
                    }
                });

                Object.defineProperty(this, 'report', {
                    enumerable: true,
                    get: function () {
                        var _this = this;
                        if (!_this.promises.report) {
                            $log.debug('[Gateway] Initializing Load of Report Definition');
                        }
                        return (_this.promises.report = _this.promises.report || $q.defer()).promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `Report Definition` to %o', val);

                        _this.promises.report = $q.defer();
                        if (_this.models.sku !== val) {
                            _this.user
                                .then(function (userResponse) {
                                    $log.debug('[Gateway] User loaded, now retrieving Report Definition info');
                                    return (!!val && _.isString(val) ? Reports.get(val) : $q.when(val));
                                })
                                .then(function (reportResponse) {
                                    _this.models.report = reportResponse;
                                    _this.promises.report.resolve(reportResponse);
                                    return reportResponse;
                                })
                                .then(function (report) {
                                    _this.models.sku = (report || {}).sku;
                                });

                        }
                    }
                });

                Object.defineProperty(this, 'applicant', {
                    enumerable: true,
                    get: function () {
                        var _this = this;
                        if (!_this.promises.applicant) {
                            loadApplicant(_this).then(
                                function (applicant) {
                                    if (!!applicant) {
                                        $log.debug('[Gateway] Finished loading applicant');
                                    }
                                }
                            );
                        }

                        return (_this.promises.applicant = _this.promises.applicant || $q.defer()).promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `Remote Applicant` to %o', val);

                        _this.promises.applicant = $q.when(val);
                    }
                });

                Object.defineProperty(this, 'application', {
                    enumerable: true,
                    get: function () {
                        var _this = this;
                        if (!_this.promises.application) {
                            $log.debug('[Gateway] Initializing Load of Job Application');

                            _this.promises.application = $q.defer();
                            $q.all({job: _this.job, user: _this.user})
                                .then(function (values) {
                                    Jobs.getApplication(values.job._id, values.user._id)
                                        .then(function (applicationResponse) {
                                            $log.debug('[Gateway] Loaded Application');
                                            _this.models.application = applicationResponse;

                                            _this.promises.application.resolve(_this.models.application);
                                        })
                                        .catch(function (err) {
                                            $log.debug('[Gateway] Failed to load Application', err);
                                            _this.models.application = {
                                                releases: []
                                            };

                                            _this.job.then(function (jobResponse) {
                                                _this.models.application.jobId = jobResponse._id;
                                            });
                                            _this.user.then(function (userResponse) {
                                                _this.models.application.userId = userResponse._id;
                                            });

                                            _this.promises.application.resolve(_this.models.application);
                                        });
                                });
                        }

                        return _this.promises.application.promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `Application` to %o', val);

                        _this.promises.application = $q.defer();

                        (!!val && _.isString(val) ? Applications.ById(val) : $q.when(val))
                            .then(function (applicationResponse) {
                                _this.models.application = applicationResponse;
                                _this.promises.application.resolve(applicationResponse);
                                return applicationResponse;
                            });
                    }
                });

                Object.defineProperty(this, 'releases', {
                    enumerable: true,
                    get: function () {
                        var _this = this;
                        return _this.application
                            .then(function (application) {
                                return application.releases;
                            });
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `Release` to %o', val);

                        _this.application
                            .then(function (application) {
                                application.releases = val;
                            });
                    }
                });

                return this.initialize(jobId, user)
                    .then(function (initialized) {
                        return self;
                    });
            }

            return Gateway;
        })();

        /*************************************************************************
         *  Private Methods
         *************************************************************************/

        var loadApplicant = function (model) {
            if (!model.promises.applicant) {
                $log.debug('[Gateway] Initializing Load of Remote Applicant');

                model.promises.applicant = $q.defer();

                return model.user
                    .then(function (user) {
                        return Applicants.getByUser(user.id);
                    })
                    .then(function (applicant) {
                        $log.debug('[Gateway] Resolving Applicant as %o', applicant);
                        model.promises.applicant.resolve(applicant);
                    })
                    .catch(function (err) {
                        $log.debug('[Gateway] No existing applicant: %s', err);
                        model.promises.applicant.resolve({});
                    });
            }
            return $q.reject('Applicant already loading');
        };

        var loadGateway = function (model) {
            if (!model.promises.applicantGateway) {

                model.promises.applicantGateway = $q.defer();

                return $q.all({co: model.company, job: model.job}).then(
                    function (values) {
                        var gw = values.job && values.job.gateway || values.co && values.co.gateway || {};

                        return gw;
                    });
            }
            return $q.reject('Applicant already loading');

        };


        return Gateway;
    };

    GatewayService.$inject = ['Authentication', 'Profiles', 'Drivers', 'Jobs', 'Companies', 'Reports', 'Applicants', 'Applications', '$state', '$log', '$q'];

    angular.module('applications')
        .service('Gateway', GatewayService);
})();
