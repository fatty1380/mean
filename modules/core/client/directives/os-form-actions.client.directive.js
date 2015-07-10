(function () {
    'use strict';


    function FormActionsDirective() {

        var template =
                '<div data-ng-show="vm.errorText" class="pull-left text-danger"><strong data-ng-bind="vm.errorText"></strong></div>'  +
                '<div class="pull-right">' +
                '   <input ng-if="vm.showCancel" type="button" class="btn btn-link" value="{{vm.cancelText}}" ng-click="vm.cancel()">' +
                '   <input ng-if="vm.showAlt" type="button" class="btn btn-default" value="{{vm.altText}}" ng-click="vm.alt()">' +
                '   <input type="submit" class="btn {{vm.submitClass}}" ng-class="{ \'disabled\': vm.disableSubmit}" value="{{vm.submitText}}">' +
                '</div>';

        var ddo = {
            template : template,
            scope: {
                disableSubmit: '=?',
                submitText: '@?',
                submitClass: '@?',
                cancelFn: '&?',
                cancelText: '@?',
                altFn: '&?',
                altText: '@?',
                errorText: '=?'
            },
            controller: function() {
                var vm = this;

                vm.showAlt = !!vm.altFn();
                vm.altText = vm.altText || 'Other Action';

                vm.showCancel = !!vm.cancelFn();
                vm.cancelText = vm.cancelText || 'cancel';

                vm.submitClass = vm.submitClass || 'btn-oset-success';
                vm.submitText = vm.submitText || 'Save';
                if(typeof vm.disableSubmit === 'undefined') {
                    vm.disableSubmit = false;
                }

                vm.alt = function() {
                    vm.altFn()();
                };
                vm.cancel = function() {
                    vm.cancelFn()();
                };
            },
            controllerAs: 'vm',
            bindToController: true

        };

        return ddo;
    }

    angular.module('core')
        .directive('osFormActions', FormActionsDirective);

})();
