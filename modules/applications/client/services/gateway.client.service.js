(function () {
    'use strict';

    function GatewayService(Authentication, Profiles, Drivers, Jobs, Companies, Reports, Applicants, Applications, $state, $log, $q) {

        var Gateway, gatewayInstance;

        Gateway = (function () {
            function Gateway() {

                this.initialize = function (job, user) {

                    if (this.initialized) {
                        $log.warn('Gateway Service was previously initialized with job `%s`', this.models.job && this.models.job._id);
                    }

                    this.reset();

                    if (!!user) {
                        this.user = user;
                    } else if (!!Authentication.isLoggedIn()) {
                        this.user = Authentication.user;
                    }

                    this.job = job;
                    this.initialized = true;

                    return $q.when(this);
                };

                this.reset = function () {
                    this.initialized = false;
                    this.models = {};
                    this.promises = {};
                };

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
                        return (!!val && _.isString(val) ? Profiles.load(val) : $q.when(val))
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
                        if (!_this.promises.driver) {
                            _this.promises.driver = $q.defer();
                            $log.debug('[Gateway] Initializing Load of Driver');
                        }
                        return (_this.promises.driver = _this.promises.driver || $q.defer()).promise;
                    },
                    set: function (val) {
                        var _this = this;

                        _this.promises.driver = _this.promises.driver || $q.defer();
                        return (!!val && _.isString(val) ? Drivers.get(val) : $q.when(val))
                            .then(function (response) {
                                $log.debug('[Gateway] Resolving `Driver` to %o', response);
                                _this.models.driver = response || new Drivers.ById({ user: _this.models.user });
                                _this.promises.driver.resolve(_this.models.driver);
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

                        _this.promises.job = _this.promises.job || $q.defer();
                        (!!val && _.isString(val) ? Jobs.get(val) : $q.when(val))
                            .then(function (response) {
                                $log.debug('[Gateway] Resolving `job` to %o', response);
                                _this.models.job = response;
                                _this.promises.job.resolve(response);
                                return response;
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
                            .then(function (response) {
                                $log.debug('[Gateway] Resolving `Company` to %o', response);
                                _this.models.company = response;
                                _this.promises.company.resolve(response);
                                return response;
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
                            .then(function (response) {
                                $log.debug('[Gateway] Resolving applicantGateway with %o', response);
                                _this.models.applicantGateway = response;
                                _this.promises.applicantGateway.resolve(response);
                                return response;
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

                        _this.promises.report = _this.promises.report || $q.defer();
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
                            $q.all({ job: _this.job, user: _this.user })
                                .then(function (values) {
                                    return Applications.ById.query({
                                        job: values.job._id,
                                        user: values.user._id
                                    }).$promise;
                                })
                                .then(function (applicationResponse) {
                                    if (_.isEmpty(applicationResponse)) {
                                        return $q.reject('No existing application');
                                    }

                                    $log.debug('[Gateway] Loaded Application');
                                    _this.models.application = _.first(applicationResponse);

                                    _this.promises.application.resolve(_this.models.application);

                                    return _this.driver;
                                })
                                .then(function (driver) {
                                    if (_.isEmpty(_this.models.application.introduction)) {
                                        _this.models.application.introduction = driver.about;
                                    }
                                })
                                .catch(function (err) {
                                    $log.debug('[Gateway] Failed to load Application', err);
                                    _this.models.application = {
                                        releases: [],
                                        isDraft: true
                                    };

                                    _this.driver.then(function (driver) {
                                        _this.models.application.introduction = driver.about;
                                    });

                                    _this.job.then(function (jobResponse) {
                                        _this.models.application.jobId = jobResponse._id;
                                    });
                                    _this.user.then(function (userResponse) {
                                        _this.models.application.userId = userResponse._id;
                                    });

                                    _this.promises.application.resolve(_this.models.application);
                                });
                        }

                        return _this.promises.application.promise;
                    },
                    set: function (val) {
                        var _this = this;
                        $log.debug('[Gateway] Setting `Application` to %o', val);

                        _this.promises.application = _this.promises.application || $q.defer();

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
            }

            gatewayInstance = this;

            return Gateway;
        })();

        /*************************************************************************
         *  Private Methods
         *************************************************************************/

        var loadApplicant = function (model) {
            if (!model.promises.applicant) {
                $log.debug('[Gateway.loadApplicant] Initializing Load of Remote Applicant');

                model.promises.applicant = $q.defer();

                return model.user
                    .then(function (user) {
                        $log.debug('[Gateway.loadApplicant] Got User');
                        return Applicants.getByUser(user.id);
                    })
                    .then(function (applicant) {
                        $log.debug('[Gateway.loadApplicant] Resolving Applicant as %o', applicant);
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
                $log.debug('[Gateway.loadGateway] Initializing Load of Applicant Gateway');

                model.promises.applicantGateway = $q.defer();

                return $q.all({ co: model.company, job: model.job }).then(
                    function (values) {
                        $log.debug('[Gateway.loadGateway] Got company & job');
                        var gw = values.job && values.job.gateway || values.co && values.co.gateway || {};

                        return gw;
                    });
            }
            return $q.reject('Applicant Gateway already loading');

        };

        Object.defineProperty(Gateway, 'getInstance', {
            enumerable: true,
            get: function () {
                debugger;
                return gatewayInstance;
            }
        });

        return Gateway;
    }

    GatewayService.$inject = ['Authentication', 'Profiles', 'Drivers', 'Jobs', 'Companies', 'Reports', 'Applicants', 'Applications', '$state', '$log', '$q'];

    angular.module('applications')
        .service('Gateway', GatewayService);
})();
