(function () {
    'use strict';

    function ApplicationGatewayController(auth, Drivers, Gateway, $state, $stateParams, $log, $q, $document, toastr) {
        var vm = this;


        Object.defineProperty(vm, 'formData', {
            enumerable: true,
            get: function () {
                return $state.current.data.formData;
            }
        });

        Object.defineProperty(vm, 'subformMethods', {
            enumerable: true,
            get: function () {
                if(!$state.current.data.methods) {
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
                return;
            },
            validate: function () {
                debugger;
                return $q.when(true);
            },
            submit: function () {
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

            var jobId = $stateParams.jobId || '54bb2b53bfbaa900002c270b';
            Gateway.initialize(jobId);

            Gateway.user.then(function(user) {
                vm.formData.user = user;
            });

            Gateway.driver.then(function(driver) {
                vm.formData.driver = driver;
            });

            Gateway.company.then(function(company) {
                vm.formData.company = company;
            });

            Gateway.job.then(function(job) {
                vm.formData.job = job;
            });

            Gateway.report.then(function(report) {
                vm.formData.report = report;
            });

            Gateway.applicant.then(function(applicant) {
                vm.formData.applicant = applicant;
            });

            Gateway.signature.then(function(signature) {
                vm.formData.signature = signature;
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
            {index: 0, active: true, state: 'gateway', title: 'Welcome'},
            {index: 1, active: true, state: 'gateway.userInfo', title: 'User Info', skip: function() { return !!vm.formData.user; }},
            {index: 2, active: true, state: 'gateway.driverInfo', title: 'Driver Info'},
            {index: 3, active: true, state: 'gateway.documents', title: 'Documents'},
            {index: 4, active: false, state: 'gateway.reports', title: 'Reports'},
            {index: 5, active: true, state: 'gateway.reportFields', title: 'Report Info', params: {readonly: false}},
            {index: 5, active: true, state: 'gateway.reportFields', title: 'Report Info', params: {readonly: true}},
            {index: 6, active: true, state: 'gateway.authorization', title: 'Authorization'},
            {index: 7, active: true, state: 'gateway.payment', title: 'Payment'},
            {index: 8, active: true, state: 'gateway.complete', title: 'Finished'},
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
                    function() {
                        $document.scrollTopAnimated(0, 300);
                    }
                );
            }
        };

        vm.routeToState = function (inc) {
            vm.currentStep += inc;

            var step = vm.activeSteps[vm.currentStep];

            if(!!step.skip && step.skip()) {
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
