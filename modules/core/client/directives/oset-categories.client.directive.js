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

            if (vm.mode === 'edit' || vm.mode === 'select') {
                $log.debug('Confirming all defaults present in edit control');
                _.each(vm.options || defaults[vm.dataType], function (option) {

                    if (_.find(vm.categories, {key: option.key})) {
                        $log.debug('driver already contains %s', option.key);
                    }
                    else {
                        $log.debug('pushing interest option %s', option.key);
                        vm.categories.push(option);
                    }

                });

                vm.summary = _.pluck(_.where(vm.categories, 'value'), 'key');
            }
        }

        vm.toggle = function(category, solo) {
            if(!!solo) {
                _.map(vm.categories, function(cat) {
                    cat.value = cat.key === category.key;
                });
            } else {
                category.value = !category.value;
            }

            if (_.find(vm.categories, {value: true})) {
                $log.debug('at least one cat selected');
                vm.showAll = false;
            }
            else {
                vm.showAll = true;
            }
            vm.summary = _.pluck(_.where(vm.categories, 'value'), 'key');
        };

        vm.allClicked = function() {
            if(vm.showAll) {
                return false;
            }

            _.map(vm.categories, function(cat) {
                cat.value = false;
            });

            vm.showAll = !vm.showAll;
            vm.summary = [];
        };

        vm.toggleCategory = function (interest) {
            if (vm.newCategory === null) {
                vm.newCategory = '';
            } else {
                vm.newCategory = null;
            }
            vm.summary = _.pluck(_.where(vm.categories, 'value'), 'key');
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
            vm.summary = _.pluck(_.where(vm.categories, 'value'), 'key');
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
                options: '=?',
                summary: '=?',
                mode: '@?',
                dataType: '@?',
                lblClass: '@?',
                showAll: '=?'
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
