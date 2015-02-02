(function () {
    'use strict';

    function ExperienceItemController(AppConfig) {

        var vm = this;

        vm.push = vm.addFn && vm.addFn();
        vm.drop = vm.dropFn && vm.dropFn();

        vm.months = vm.months || AppConfig.getMonths();

        console.log('Got %d Months', vm.months.length);

        vm.isEditing = !!vm.editMode || !!vm.model.isFresh;
        vm.editEnable = typeof vm.editEnable === undefined ? true : !!vm.editEnable;

        vm.revertValue = angular.copy(vm.model);

        vm.edit = function () {
            vm.revertValue = angular.copy(vm.model);
            vm.isEditing = true;
        };

        vm.cancel = function () {
            debugger;
            if (vm.model.isFresh) {
                // This is a brand-new experience object
                if (vm.dropFn) {
                    vm.dropFn(vm.model);
                } else {
                    vm.model = null;
                }
            } else {
                vm.model = angular.copy(vm.revertValue);
            }

            vm.isEditing = false;
        };


        vm.save = function (action) {
            if (vm.experienceForm.$pristine && vm.model.isFresh) {
                if (vm.dropFn) {
                    vm.dropFn(vm.model);
                } else {
                    vm.model = null;
                }
                vm.experienceForm.$setValidity('model', true);
                vm.experienceForm.$setSubmitted();
                return true;
            }

            if (vm.experienceForm.$valid) {
                vm.model.isFresh = false;
                if (action === 'add') {
                    var addMore = vm.push();
                }
            } else {
                debugger;
                event.stopPropigation();
                vm.error = 'Please correct the errors above before saving this experience';
                return false;
            }

            vm.isEditing = false;
        };


        vm.getDateRange = function (time) {
            var s, e;

            if (time.start && (s = moment(time.start))) {
                if (time.end && (e = moment(time.end))) {
                    return s.format('MMMM, YYYY') + ' - ' + e.format('MMMM, YYYY');
                }
                return s.format('MMMM, YYYY') + ' - present';
            }
            return null;
        };
    }

    function ExperienceDirective() {
        return {
            priority: 0,
            templateUrl: 'modules/drivers/views/templates/experience.client.template.html',
            replace: false,
            restrict: 'E',
            scope: {
                model: '=',
                editMode: '=?',
                editEnable: '=?',
                addFn: '&?',
                dropFn: '&?',
                isLast: '=?'
            },
            controller: 'ExperienceItemController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    ExperienceItemController.$inject = ['AppConfig'];

    function ExperienceListController() {
        var vm = this;

        vm.drop = drop;
        vm.add = add;


        function drop(exp) {
            exp = exp || vm.exp;

            if (exp) {
                for (var i in vm.models) {
                    if (vm.models[i] === exp) {
                        vm.models.splice(i, 1);
                    }
                }
            }
        }

        function add() {

            vm.models.push({
                text: '',
                time: {
                    start: {},
                    end: {}
                },
                location: '',
                isFresh: true
            });
        }
    }

    function ExperienceListDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/drivers/views/templates/experience-list.client.template.html',
            restrict: 'E',
            scope: {
                models: '=list',
                canEdit: '=?'
            },
            controller: 'ExperienceListController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('drivers')
        .controller('ExperienceItemController', ExperienceItemController)
        .directive('osetExperienceItem', ExperienceDirective)
        .controller('ExperienceListController', ExperienceListController)
        .directive('osetExperienceList', ExperienceListDirective);


})();
