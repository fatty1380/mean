(function() {
    'use strict';

    function ExperienceDirectiveController($scope, $element, $attrs, $transclude) {

        var vm = this;

        vm.editMode = typeof vm.editMode === undefined ? true : !!vm.editMode;
        vm.editEnable = typeof vm.editEnable === undefined ? true : !!vm.editEnable;

        vm.pristine = angular.copy(vm.model);

        vm.edit = function() {
            vm.pristine = angular.copy(vm.model);
            vm.editMode = true;
        };

        vm.cancel = function() {
            if (vm.model.isFresh) {
                // This is a brand-new experience object
                if (vm.dropFn) {
                    vm.dropFn(vm.model);
                } else {
                    vm.model = null;
                }
            } else {
                vm.model = angular.copy(vm.pristine);
            }

            vm.editMode = false;
        };


        vm.save = function(event) {
            debugger;
            if(vm.experienceForm.$valid) {
                var options = event.clickOptions;
                if (options && options.hasOwnProperty('add')) {
                    var addMore = vm.addFn && vm.addFn();
                }
            } else{
                event.stopPropigation();
                vm.error = 'Please correct the errors above before saving this experience';
                return false;
            }

            vm.editMode = false;
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
                dropFn: '&?'
            },
            controller: ExperienceDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    ExperienceDirectiveController.$inject = ['$scope', '$element', '$attrs', '$transclude'];

    angular.module('drivers').directive('osDriverExperience', ExperienceDirective);


})();
