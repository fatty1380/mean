(function () {
    'use strict';

    function ApplicationGatewayController(auth, Applications, $state, gateway, $log, $q, $document, toastr) {
        var vm = this;

        vm.debug = false;
        vm.gw = gateway;

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

        vm.activeSteps = [];

        function initialize() {
            debugger;

            vm.gw.applicantGateway.then(function (gw) {
                vm.gatewayReportsEnabled = (!!gw && !!gw.sku);
                vm.gatewayReleaseEnabled = (!!gw && !!gw.releaseType);
                vm.enableFinalCheckbox = false;

                var activeSteps = _.where(vm.steps, function (step) {
                    return _.isFunction(step.active) ? !!step.active() : !!step.active;
                });
                $log.debug('%d total steps, %d active steps', vm.steps.length, activeSteps.length);

                _.each(activeSteps, function (step) {
                    vm.activeSteps.push(step);
                });

                vm.currentIndex = _.findIndex(vm.activeSteps, {'state': $state.current.name});
                vm.currentStep = _.find(vm.activeSteps, {'state': $state.current.name});


                debugger;
                if(!_.isEmpty(vm.gw.models.application) && !vm.gw.models.application.isDraft) {
                    debugger;
                    $log.info('this job has already been applied to');
                    toastr.info('You have already applied to this job', {extendedTimeOut: 5000});

                    vm.currentIndex = _.findIndex(vm.activeSteps, {'state': 'gateway.complete'});
                    vm.currentStep = _.find(vm.activeSteps, {'state': 'gateway.complete'});

                    $state.go('gateway.complete');
                }
            });
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
            {active: isGWEnabled, state: 'gateway.reports', title: 'Reports'},
            {active: isGWEnabled, state: 'gateway.reportFields', title: 'Report Entry', params: {readonly: false}},
            {active: isGWEnabled, state: 'gateway.reportFields', title: 'Confirmation', params: {readonly: true}},
            {active: isReleaseEnabled, state: 'gateway.authorization', title: 'Authorization'},
            //{active: true, state: 'gateway.payment', title: 'Payment'},
            {active: true, state: 'gateway.complete', title: '&nbsp;', isLast: true},
        ];

        function isGWEnabled() {
            return !!vm.gatewayReportsEnabled;
        }

        function isReleaseEnabled() {
            return !!vm.gatewayReleaseEnabled;
        }

        vm.goBack = function () {
            if (vm.currentIndex > 0) {
                vm.resetSubformMethods();
                vm.routeToState(-1);
            }
        };

        vm.goNext = function () {

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

                    if (vm.currentIndex < vm.activeSteps.length - 1) {
                        vm.resetSubformMethods();
                        vm.routeToState(1);
                        vm.error = vm.success = null;
                    } else {
                        vm.setComplete();
                    }
                }
            ).catch(
                function (err) {
                    $log.warn('Unable to continue to next step due to %o', err);

                    vm.error = _.isString(err) && err || err && err.data && err.data.message || err && err.message || 'Unable to process the previous action.';

                    toastr.error(vm.error || err, {extendedTimeOut: 5000});
                }
            ).finally(
                function () {
                    $document.scrollTopAnimated(0, 300);
                }
            );
        };

        vm.setComplete = function() {
            toastr.info('Completed Application!');
        };

        vm.submitApplication = function () {
            if (!!vm.enableFinalCheckbox && !vm.gw.models.application.termsAccepted) {
                toastr.error('You must accept the terms before submitting your application', {extendedTimeOut: 5000});
                return;
            }
            if (vm.currentStep.isLast) {

                vm.gw.application
                    .then(function (application) {

                        application = _.extend(application, {
                            status: 'submitted',
                            agreement: vm.gw.models.application.agreement,
                            jobId: vm.gw.models.job._id
                        });

                        if(_.isEmpty(application.introduction) && !_.isEmpty(vm.gw.models.driver.about)) {
                            application.introduction = vm.gw.models.driver.about;
                        }

                        var upsertMethod, upsertPromise, params;

                        if (_.isEmpty(application._id)) {
                            upsertMethod = (new Applications.ByJob(application)).$save;
                            params = {jobId: application.jobId};

                            upsertPromise = upsertMethod(params);
                        }
                        else if (_.isFunction(application.$update)) {
                            upsertPromise = application.$update();
                        } else {
                            upsertMethod = (new Applications.ById(application)).$update;
                            params = {id: application._id};

                            upsertPromise = upsertMethod(params);
                        }

                        // Redirect after save
                        return upsertPromise
                            .then(function (success) {
                                $log.debug('Successfully created an application: %o', success);

                                _.extend(vm.gw.models.application, success);

                                vm.success = 'Application Submission Successful!';
                            });
                    })
                    .catch(function (err) {
                        $log.error('Failed to create application', err);

                        vm.error = err;

                        toastr.error(err, {extendedTimeOut: 5000});
                    })
                    .finally(function () {
                        $document.scrollTopAnimated(0, 300);
                    });
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

    ApplicationGatewayController.$inject = ['Authentication', 'Applications', '$state', 'gateway', '$log', '$q', '$document', 'toastr'];

    angular.module('applications')
        .controller('ApplicationGatewayController', ApplicationGatewayController);
})();
