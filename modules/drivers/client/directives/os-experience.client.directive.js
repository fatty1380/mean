(function () {
    'use strict';

    function ExperienceDirectiveController(AppConfig) {

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
            vm.error = null;
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
            vm.error = null;
            debugger;

            vm.experienceForm.$setSubmitted(true);

            if (vm.experienceForm.$pristine && vm.model.isFresh) {
                debugger;
                if (vm.dropFn) {
                    vm.dropFn(vm.model);
                } else {
                    vm.model = null;
                }
                vm.experienceForm.$setValidity('model', true);
                vm.experienceForm.$setSubmitted();
                return true;
            }

            if (vm.experienceForm.$invalid) {

                if (vm.experienceForm.$error.required) {
                    vm.error = 'Please fill in all required fields before saving';
                }
                else {
                    vm.error = 'Please correct the errors on the page before saving';
                }

                return false;
            }

            vm.model.isFresh = false;
            if (action === 'add') {
                var addMore = vm.push();
            }

            debugger; // check date objects
            vm.isEditing = false;
        };


        vm.getDateRange = function (startDate, endDate) {
            var s, e;

            if (startDate && (s = moment(startDate))) {
                if (endDate && (e = moment(endDate))) {
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
            controller: ExperienceDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    ExperienceDirectiveController.$inject = ['AppConfig'];

    angular.module('drivers').directive('osDriverExperience', ExperienceDirective);


})();
