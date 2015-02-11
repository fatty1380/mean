(function () {
    'use strict';

    var defaults = {
        driver: [
            {key: 'Courier', value: false},
            {key: 'Local CDL', value: false},
            {key: 'Long Haul CDL', value: false},
            {key: 'Taxi/Limo', value: false},
            {key: 'Ridesharing (Uber/Lyft)', value: false},
            {key: 'Non-Emergency Medical', value: false}
        ],
        job: [
            {key: 'Courier', value: false},
            {key: 'Local CDL', value: false},
            {key: 'Long Haul CDL', value: false},
            {key: 'Taxi/Limo', value: false},
            {key: 'Ridesharing (Uber/Lyft)', value: false},
            {key: 'Non-Emergency Medical', value: false}
        ]
    };

    function CategoriesDirectiveController($log) {
        var vm = this;

        vm.mode = vm.mode || 'edit';
        vm.dataType = vm.dataType || 'driver';
        vm.newCategory = null;

        if (!vm.categories) {
            vm.categories = [];
        }

        if (!!vm.categories) {
            $log.debug('Initalizing CategoriesDirective in %s mode with %d categories', vm.mode, vm.categories.length);

            if (vm.mode === 'edit') {
                $log.debug('Confirming all defaults present in edit control');
                _.each(defaults[vm.dataType], function (option) {

                    if (_.find(vm.categories, {key: option.key})) {
                        $log.debug('driver already contains %s', option.key);
                    }
                    else {
                        $log.debug('pushing interest option %s', option.key);
                        vm.categories.push(option);
                    }

                });
            }
        }

        vm.toggleCategory = function (interest) {
            if (vm.newCategory === null) {
                vm.newCategory = '';
            } else {
                vm.newCategory = null;
            }
        };

        vm.addCategory = function () {
            if (!!vm.newCategory) {
                var existing = _.find(vm.categories, {key: vm.newCategory});

                if (existing) {
                    existing.value = true;
                } else {
                    vm.categories.push({key: vm.newCategory, value: true});
                }
            }
            vm.newCategory = null;
        };
    }

    function CategoryDirective() {
        var ddo;

        ddo = {
            templateUrl: '/modules/core/views/templates/oset-categories.client.template.html',
            restrict: 'E',
            transclude: true,
            scope: {
                categories: '=model',
                mode: '@?',
                dataType: '@?',
                lblClass: '@?'
            },
            controller: 'CategoriesDirectiveController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    CategoriesDirectiveController.$inject = ['$log'];

    angular.module('applications')
        .controller('CategoriesDirectiveController', CategoriesDirectiveController)
        .directive('osetCategories', CategoryDirective);
})();
