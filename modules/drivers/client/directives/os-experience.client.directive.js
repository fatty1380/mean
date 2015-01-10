(function() {
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

        vm.edit = function() {
            vm.revertValue = angular.copy(vm.model);
            vm.isEditing = true;
        };

        vm.cancel = function() {
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


        vm.save = function(action) {
            if(vm.experienceForm.$pristine && vm.model.isFresh) {
                if (vm.dropFn) {
                    vm.dropFn(vm.model);
                } else {
                    vm.model = null;
                }
                vm.experienceForm.$setValidity('model', true);
                vm.experienceForm.$setSubmitted();
                return true;
            }

            if(vm.experienceForm.$valid) {
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


        vm.getDateRange = function(time) {
            var s,e;

            if(time.start && (s = moment(time.start))) {
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
            controller: ExperienceDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    ExperienceDirectiveController.$inject = ['AppConfig'];

    angular.module('drivers').directive('osDriverExperience', ExperienceDirective);


})();
