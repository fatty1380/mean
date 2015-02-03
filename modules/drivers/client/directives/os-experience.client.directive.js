(function () {
    'use strict';

    function ExperienceDirectiveController(AppConfig, $attrs) {

        var vm = this;

        vm.push = angular.isDefined($attrs.addFn) ? vm.addFn() : null;
        vm.drop = angular.isDefined($attrs.dropFn) ? vm.dropFn() : null;

        vm.months = vm.months || AppConfig.getMonths();

        console.log('Got %d Months', vm.months.length);

        vm.isEditing = !!vm.editMode || !!vm.model.isFresh;
        vm.editEnable = typeof vm.editEnable === undefined ? !vm.viewOnly : !!vm.editEnable;

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
                if (vm.drop) {
                    vm.drop(vm.model);
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

                vm.cancel();
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
                vm.push();
            }

            debugger; // check date objects
            vm.isEditing = false;
        };


        vm.getDateRangeString = function (startDate, endDate) {
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
                isLast: '=?',
                viewOnly: '=?'
            },
            controller: ExperienceDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    ExperienceDirectiveController.$inject = ['AppConfig', '$attrs'];

    angular.module('drivers').directive('osDriverExperience', ExperienceDirective);


})();
