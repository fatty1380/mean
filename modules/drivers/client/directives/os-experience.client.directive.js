(function () {
    'use strict';


    angular.module('drivers')
        .directive('osetExperienceItem', ExperienceItemDirective);
        
    function ExperienceItemDirective() {
        return {
            priority: 0,
            templateUrl: '/modules/drivers/views/templates/experience.client.template.html',
            replace: false,
            restrict: 'E',
            scope: {
                model: '=',
                editMode: '=?',
                canEdit: '=?',
                addFn: '&?',
                dropFn: '&?',
                isLast: '=?',
                modelIndex: '=?',
                viewOnly: '=?'
            },
            require: ['^osetExperienceList', '^?form'],
            link: function(scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[1];
                scope.vm.list = ctrls[0];
            },
            controller: ExperienceItemController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    ExperienceItemController.$inject = ['AppConfig', '$attrs'];
    function ExperienceItemController(AppConfig, $attrs) {

        var vm = this;

        vm.push = angular.isDefined($attrs.addFn) ? vm.addFn() : null;
        vm.drop = angular.isDefined($attrs.dropFn) ? vm.dropFn() : null;

        vm.months = vm.months || AppConfig.getMonths();

        console.log('Got %d Months', vm.months.length);

        vm.isEditing = !!vm.editMode || !!vm.model.isFresh;
        vm.canEdit = typeof vm.canEdit === undefined ? !vm.viewOnly : !!vm.canEdit;

        vm.revertValue = angular.copy(vm.model);

        vm.activate = function() {
            vm.formItem = vm.form['experienceItem_'+vm.modelIndex];
            return !!vm.formItem;
        };

        vm.edit = function () {
            vm.revertValue = angular.copy(vm.model);
            vm.isEditing = true;
        };

        vm.cancel = function () {
            vm.error = null;
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

            vm.formItem = vm.formItem || vm.form['formItem_'+ vm.modelIndex];

            //vm.formItem.$setSubmitted(true);
            vm.formItem._submitted = true;

            if (action !== 'add' && vm.formItem.$pristine && vm.model.isFresh) {

                vm.cancel();
                vm.formItem.$setValidity('model', true);
                vm.formItem.$setSubmitted();
                return true;
            }

            if (vm.formItem.$invalid) {

                if (vm.formItem.$error.required) {
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

        //vm.form.save = vm.save;
        //vm.form.cancel = vm.cancel;
    }
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    angular.module('drivers')
        .directive('osetExperienceList', ExperienceListDirective);
        
    function ExperienceListDirective() {
        var ddo;
        ddo = {
            templateUrl: '/modules/drivers/views/templates/experience-list.client.template.html',
            restrict: 'E',
            scope: {
                models: '=list',
                canEdit: '=?',
                viewOnly: '=?',
                maxCt: '=?'
            },
            require: ['^?form'],
            link: function(scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
            },
            controller: ExperienceListController,
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    ExperienceListController.$inject = ['$log'];
    function ExperienceListController($log) {
        var vm = this;

        vm.viewOnly = vm.viewOnly || false;
        vm.canEdit = typeof vm.canEdit === undefined ? !vm.viewOnly : !!vm.canEdit;
        vm.maxCt = vm.maxCt || 50;
        vm.isEditing = false;

        if(vm.canEdit && !!vm.models && !!vm.models.length) {
            var lastModel = vm.models[vm.models.length-1];
            if(lastModel.isFresh || _.isEmpty(lastModel)) {
                lastModel.isFresh = true;
                vm.isEditing = true;
            }
        }

        vm.drop = drop;
        vm.add = add;

        function drop(exp) {
            var index = _.remove(vm.models, exp);

            if(!!index) {
                $log.debug('Successfully removed experience');
            }
        }

        function add() {
            vm.models.push({
                text: '',
                startDate: null,
                endDate: null,
                location: '',
                isFresh: true
            });

            vm.maxCt++;
        }
    }

})();
