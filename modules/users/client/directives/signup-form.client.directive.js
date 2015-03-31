(function () {
    'use strict';

    function SignupFormCtrl($log, $q, UserService, Gateway) {
        var vm = this;

        vm.user = _.defaults(vm.user || {}, {type: 'driver', terms: false, addresses: [{}]});

        vm.text = _.defaults(vm.text || {}, {
            zip: 'Your zip code will be used to help improve your experience on the site',
            password: 'Please enter a password of at least 8 characters. This will be used to ensure your secure access to the site'
        });

        vm.focusEmail = true;

        vm.methods = _.defaults({
            submit: function () {
                return UserService.createUser(vm.user)
                    .then(function(success) {
                        debugger;
                        Gateway.user = success;
                    });
            },
            validate: function () {
                var deferred = $q.defer();

                if (vm.user.password !== vm.user.confirmPassword) {
                    $log.debug('passwords do not match, yo!');
                    deferred.reject('Passwords to not match. Please enter them again');
                }
                else if (!!vm.form && vm.form.$invalid) {
                    _.map(_.keys(vm.form.$error), function (errorType) {
                        $log.warn('[SignupApply.validateForm] Form %d has error type: %s', vm.currentStep, errorType);
                        _.map(vm.form.$error[errorType], function (item) {
                            $log.error('[SignupApply.validateForm] %s has error: %o', item.$name, item);
                            if (!!item) {
                                item.$setDirty(true);
                            }
                        });
                    });
                    deferred.reject('please correct the errors above');
                }
                else if (!vm.user.terms) {
                    deferred.reject('Please agree to the terms and conditions before signing up');
                } else {
                    deferred.resolve('User Form is Valid');
                }

                return deferred.promise;
            }
        }, vm.methods);
    }

    SignupFormCtrl.$inject = ['$log', '$q', 'UserService', 'Gateway'];

    function SignupFormDirective() {
        return {
            templateUrl: '/modules/users/views/templates/signup-form.client.template.html',
            restrict: 'E',
            require: ['^form'],
            scope: {
                user: '=model',
                text: '=?',
                methods: '=?'
            },
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
            },
            controller: 'SignupFormController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    angular.module('users')
        .controller('SignupFormController', SignupFormCtrl)
        .directive('userSignupForm', SignupFormDirective);
})();
