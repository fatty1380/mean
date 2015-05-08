(function() {
    'use strict';

    /**
    * @ngdoc directive
    * @name core.directive:osProfile
    * @element os-profile
    * @restrict E
    * --------------------
    * @description
    * Used to display a User Profile, including Company or Driver profile information
    */

    angular.module('users')
        .directive('osetSeedSignup', [
            function() {
                return {
                    scope: {
                        model: '=?',
                        showForm: '=?',
                        hideName: '=?',
                        btnClass: '@?'
                    },
                    templateUrl: '/modules/users/views/templates/seed-user-form.client.template.html',
                    restrict: 'E',
                    controller: 'SeedUserController',
                    controllerAs: 'vm',
                    bindToController: true
                };
            }
        ])
        .controller('SeedUserController', ['$log', 'SeedService',
            function($log, Seed) {
                var vm = this;
                vm.model = vm.model || {};
                vm.showForm = vm.showForm || false;
                vm.hideName = vm.hideName || false;
                vm.btnClass = vm.btnClass || 'button get-started';

                vm.interestOptions = [
                    {key: 'Local', value: false},
                    {key: 'Long Haul', value: false},
                    {key: 'Indep. Operator', value: false},
                    {key: 'Fleet Mgmt.', value: false},
                ];

                vm.postSeed = function () {

                    var seed = new Seed(vm.model);

                    seed.$save()
                        .then(function (success) {
                            $log.debug('Successfully Saved seed user: %o', success);

                            vm.model.success = 'Thank you for your interest, We will let you know as soon as we launch!';
                        })
                        .catch(function (err) {

                            if(_.contains(err.data.message.toLowerCase(), 'unique field')) {
                                vm.model.success = 'Thank you again for signing up. We will let you know as soon as we launch';
                            }
                            else {
                                vm.model.error = err.data.message || err;
                            }

                        });

                };
            }
        ]);
})();
