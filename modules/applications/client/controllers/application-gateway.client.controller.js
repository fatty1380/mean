(function () {
    'use strict';

    function ApplicationGatewayController(auth, Applications, Gateway, $state, $stateParams, $log, $q, $document, toastr) {
        var vm = this;

        Object.defineProperty(vm, 'formData', {
            enumerable: true,
            get: function () {
                if (_.isEmpty($state.current.data.formData)) {
                    $state.current.data.formData = Gateway.models;
                }
                return $state.current.data.formData;
            }
        });

        Object.defineProperty(vm, 'subformMethods', {
            enumerable: true,
            get: function () {
                if (!$state.current.data.methods) {
                    $state.current.data.methods = defaultMethods;
                }

                return $state.current.data.methods;
            },
            set: function (val) {
                $state.current.data.methods = val;
            }
        });

        /* Bindings to sub-forms */
        var defaultMethods = {
            init: function () {
                $log.debug('[GatewayCtrl] Root Init');
                return;
            },
            validate: function () {
                $log.debug('[GatewayCtrl] Root Validate');
                return $q.when(true);
            },
            submit: function () {
                $log.debug('[GatewayCtrl] Root Submit');
                return $q.when(true);
            }
        };

        vm.resetSubformMethods = function () {
            vm.subformMethods.init = defaultMethods.init;
            vm.subformMethods.validate = defaultMethods.validate;
            vm.subformMethods.submit = defaultMethods.submit;
            $log.debug('[AppGatewayCtrl] Reset Subform Methods');
        };

        //_.defaults(vm.formData, {
        //    job: {},
        //    company: {},
        //    user: {},
        //    driver: {},
        //    report: {},
        //    applicant: {},
        //    signature: {}
        //});

        function initialize() {

            vm.gw = Gateway;

            //Gateway.user.then(function (user) {
            //    vm.formData.user = user;
            //    $log.info('[GatewayCtrl] Set FormData user: %o', user);
            //});
            //vm.formData.user = Gateway.user;

            Gateway.driver.then(function (driver) {
                //vm.formData.driver = driver;
                $log.info('[GatewayCtrl] Set FormData driver: %o', driver);
            });

            Gateway.company.then(function (company) {
                //vm.formData.company = company;
                $log.info('[GatewayCtrl] Set FormData company: %o', company);
            });

            Gateway.job.then(function (job) {
                //vm.formData.job = job;
                $log.info('[GatewayCtrl] Set FormData job: %o', job);
            });

            Gateway.report.then(function (report) {
                //vm.formData.report = report;
                $log.info('[GatewayCtrl] Set FormData report: %o', report);
            });

            Gateway.applicant.then(function (applicant) {
                //vm.formData.applicant = applicant;
                $log.info('[GatewayCtrl] Set FormData applicant: %o', applicant);
            });

            Gateway.release.then(function (release) {
                if (_.isEmpty(release)) {
                    Gateway.release = release = {signature: {}};
                }
                //vm.formData.release = release;
                //vm.formData.signature = release.signature;
                $log.info('[GatewayCtrl] Set FormData release: %o', release);
            });


            //
            //vm.formData.user = auth.user || {};
            //
            //if (!!auth.user && _.isString(auth.user.driver)) {
            //    vm.formData.driver = Applications.get(auth.user.driver)
            //        .catch(function (err) {
            //            $log.debug('[GatewayCtrl] Err getting driver for id `%s`: %s', auth.user.driver, err);
            //            return {};
            //        });
            //} else if (_.isObject(auth.user.driver)) {
            //    vm.formData.driver = auth.user.driver;
            //}
        }

        vm.getKeys = function (object) {
            var keys = _.keys(object);

            return _.where(keys, function (k) {
                return !_.isFunction(object[k]);
            });
        };

        vm.getFunctionKeys = function () {
            var keys = _.keys(vm.subformMethods);

            return keys;
        };

        /* Local 'state' variables */
        vm.steps = [
            {active: true, state: 'gateway', title: '&nbsp;'},
            {
                active: (function () {
                    return !auth.user;
                })(), state: 'gateway.userInfo', title: 'User Info'
            },
            {active: true, state: 'gateway.driverInfo', title: 'Driver Info'},
            {active: true, state: 'gateway.documents', title: 'Documents'},
            {active: true, state: 'gateway.reports', title: 'Reports'},
            {active: true, state: 'gateway.reportFields', title: 'Report Entry', params: {readonly: false}},
            {active: true, state: 'gateway.reportFields', title: 'Confirmation', params: {readonly: true}},
            {active: true, state: 'gateway.authorization', title: 'Authorization'},
            {active: true, state: 'gateway.payment', title: 'Payment'},
            {active: true, state: 'gateway.complete', title: '&nbsp;', isLast: true},
        ];

        vm.activeSteps = _.where(vm.steps, {'active': true});

        vm.currentIndex = _.findIndex(vm.activeSteps, {'state': $state.current.name});
        vm.currentStep = _.find(vm.activeSteps, {'state': $state.current.name});

        vm.goBack = function () {
            if (vm.currentIndex > 0) {
                vm.resetSubformMethods();
                vm.routeToState(-1);
            }
        };

        vm.goNext = function () {
            if (vm.currentIndex < vm.activeSteps.length - 1) {
                debugger;

                vm.subformMethods.validate().then(
                    function (success) {
                        $log.debug('successfully validated form for step %s', vm.currentStep.state);

                        return vm.subformMethods.submit();
                    }
                ).then(
                    function (success) {
                        $log.debug('successfully submitted form for step #%d', vm.currentIndex);

                        return $q.when(success);
                    }
                ).then(
                    function (success) {
                        vm.resetSubformMethods();
                        vm.routeToState(1);
                    }
                ).catch(
                    function (err) {
                        $log.warn('Unable to continue to next step due to %o', err);

                        vm.error = err;

                        toastr.error(err, {extendedTimeOut: 5000});
                    }
                ).finally(
                    function () {
                        vm.error = vm.success = null;
                        $document.scrollTopAnimated(0, 300);
                    }
                );
            }
        };

        vm.submitApplication = function () {
            if (!vm.gw.models.application.termsAccepted) {
                toastr.error('You must accept the terms before submitting your application', {extendedTimeOut: 5000});
                return;
            }
            if (vm.currentStep.isLast) {
                var application = vm.gw.models.application;

                debugger;

                application = _.extend(application, {
                    status: 'submitted',
                    agreement: vm.gw.models.application.termsAccepted,
                    jobId: vm.gw.models.job._id,
                    introduction: vm.gw.models.driver.about,
                    release: vm.gw.models.application.release
                });

                var upsertMethod, params;

                if (_.isEmpty(application._id)) {
                    application = new Applications.ByJob(application);
                    upsertMethod = application.$save;
                    params = {jobId: application.jobId};
                }
                else {
                    application = !!application.$update ? application : new Applications.ById(application);
                    upsertMethod = application.$update;
                }

                // Redirect after save
                upsertMethod()
                    .then(function (success) {
                        $log.debug('Successfully created an application: %o', success);

                        //vm.gateway.application = success;
                        _.extend(vm.gateway.application, success);

                        vm.success = 'Application Submission Successful!';
                    })
                    .catch(function (err) {
                        $log.error('Failed to create application', err);
                        $log.error('TEMPORARY WORKAROUND IN PLACE FOR DEMO');

                        //vm.error = err;

                        //toastr.error(err, {extendedTimeOut: 5000});

                        //vm.gateway.application = success;

                        vm.success = 'Application Submission Successful!';
                    }
                ).finally(
                    function () {
                        $document.scrollTopAnimated(0, 300);
                    }
                );
            } else {
                return $state.go(vm.currentStep.state);
            }
        };

        vm.routeToState = function (inc) {
            vm.currentIndex += inc;

            var step = vm.currentStep = vm.activeSteps[vm.currentIndex];

            if (!!step.skip && step.skip()) {
                $log.info('Skipping step #%d', vm.currentIndex);
                vm.currentIndex += inc;
                step = vm.currentStep = vm.activeSteps[vm.currentIndex];
            }

            $log.debug('[Gateway] Routing to %s', step.state);
            $state.go(step.state, step.params);
        };


        vm.submitForm = function ($event) {
            alert('Master Form Submitted');
        };

        initialize();
    }

    ApplicationGatewayController.$inject = ['Authentication', 'Applications', 'Gateway', '$state', '$stateParams', '$log', '$q', '$document', 'toastr'];

    angular.module('applications')
        .controller('ApplicationGatewayController', ApplicationGatewayController);
})();
