(function () {
    'use strict';

    function ApplicationGatewayController(auth, Drivers, Gateway, $state, $stateParams, $log, $q, $document, toastr) {
        var vm = this;

        Object.defineProperty(vm, 'formData', {
            enumerable: true,
            get: function () {
                if(_.isEmpty($state.current.data.formData)) {
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
            vm.subformMethods = null;
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
            $log.info('[GatewayCtrl] Initialziing');

            vm.gw = Gateway;

            var jobId = $stateParams.jobId || '54bb2b53bfbaa900002c270b';
            Gateway.initialize(jobId);

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
            //    vm.formData.driver = Drivers.get(auth.user.driver)
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
            {index: 0, active: true, state: 'gateway', title: '&nbsp;'},
            {
                index: 1, active: (function () {
                return !auth.user;
            })(), state: 'gateway.userInfo', title: 'User Info'
            },
            {index: 2, active: true, state: 'gateway.driverInfo', title: 'Driver Info'},
            {index: 3, active: true, state: 'gateway.documents', title: 'Documents'},
            {index: 4, active: false, state: 'gateway.reports', title: 'Reports'},
            {index: 5, active: true, state: 'gateway.reportFields', title: 'Report Info', params: {readonly: false}},
            {index: 5, active: true, state: 'gateway.reportFields', title: 'Confirmation', params: {readonly: true}},
            {index: 6, active: true, state: 'gateway.authorization', title: 'Authorization'},
            {index: 7, active: true, state: 'gateway.payment', title: 'Payment'},
            {index: 8, active: true, state: 'gateway.complete', title: '&nbsp;'},
        ];

        vm.activeSteps = _.where(vm.steps, {'active': true});

        vm.currentStep = _.findIndex(vm.activeSteps, {'state': $state.current.name});

        vm.goBack = function () {
            if (vm.currentStep > 0) {
                vm.resetSubformMethods();
                vm.routeToState(-1);
            }
        };

        vm.goNext = function () {
            if (vm.currentStep < vm.activeSteps.length - 1) {

                vm.subformMethods.validate().then(
                    function (success) {
                        $log.debug('successfully validated form for step #%d', vm.currentStep);

                        return vm.subformMethods.submit();
                    }
                ).then(
                    function (success) {
                        $log.debug('successfully submitted form for step #%d', vm.currentStep);

                        return $q.when(success);
                    }
                ).then(
                    function (success) {
                        vm.resetSubformMethods();
                        vm.routeToState(1);
                    }
                ).catch(
                    function (err) {
                        $log.warn('Unable to continue to next step due to %j', err);

                        vm.error = err;

                        toastr.error(err, {extendedTimeOut: 5000});
                    }
                ).finally(
                    function () {
                        $document.scrollTopAnimated(0, 300);
                    }
                );
            }
        };

        vm.routeToState = function (inc) {
            vm.currentStep += inc;

            var step = vm.activeSteps[vm.currentStep];

            if (!!step.skip && step.skip()) {
                $log.info('Skipping step #%d', vm.currentStep);
                vm.currentStep += inc;
                step = vm.activeSteps[vm.currentStep];
            }

            $log.debug('[Gateway] Routing to %s', step.state);
            $state.go(step.state, step.params);
        };

        vm.currentState = function () {
            return $state.current.name;
        };


        vm.submitForm = function ($event) {
            alert('Master Form Submitted');
        };

        initialize();
    }

    ApplicationGatewayController.$inject = ['Authentication', 'Drivers', 'Gateway', '$state', '$stateParams', '$log', '$q', '$document', 'toastr'];

    angular.module('applications')
        .controller('ApplicationGatewayController', ApplicationGatewayController);
})();
