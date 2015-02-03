(function () {
    'use strict';

    function ExperienceItemController(AppConfig, $attrs) {

        var vm = this;

        vm.push = angular.isDefined($attrs.addFn) ? vm.addFn() : null;
        vm.drop = angular.isDefined($attrs.dropFn) ? vm.dropFn() : null;

        vm.months = vm.months || AppConfig.getMonths();

        console.log('Got %d Months', vm.months.length);

        vm.isEditing = !!vm.editMode || !!vm.model.isFresh;
        vm.canEdit = typeof vm.canEdit === undefined ? !vm.viewOnly : !!vm.canEdit;

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
                canEdit: '=?',
                addFn: '&?',
                dropFn: '&?',
                isLast: '=?',
                viewOnly: '=?'
            },
            controller: 'ExperienceItemController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    ExperienceItemController.$inject = ['AppConfig', '$attrs'];

    function ExperienceListController() {
        debugger;
        var vm = this;

        vm.viewOnly = vm.viewOnly || false;
        vm.canEdit = typeof vm.canEdit === undefined ? !vm.viewOnly : !!vm.canEdit;
        vm.maxCt = vm.maxCt || 50;

        vm.drop = drop;
        vm.add = add;

        function drop(exp) {
            var index = _.remove(vm.driver.experience, exp);

            if(!!index) {
                $log.debug('Successfully removed experience');
            }
        }

        function add() {
            vm.driver.experience.push({
                text: '',
                startDate: null,
                endDate: null,
                location: '',
                isFresh: true
            });

            vm.maxCt++;
        }
    }

    function ExperienceListDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/drivers/views/templates/experience-list.client.template.html',
            restrict: 'E',
            scope: {
                models: '=list',
                canEdit: '=?',
                viewOnly: '=?',
                maxCt: '=?'
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
