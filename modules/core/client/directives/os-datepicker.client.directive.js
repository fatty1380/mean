(function() {
    'use strict';

    angular.module('core')
        /** @ngdoc
         *   @description Self Contained Date Picker element for use on pages
         *   @param {object} model       The model to render and save @required
         *   @param {string} dp-class    CSS Class names to include @optional
         *   @param {boolean} required   Attribute indicating that the field is required
         *                               on the form. May be used as a standalone attibute
         *                               or as a boolean.
         */
        .directive('osDatePicker', [function() {
            return {
                priority: 0,
                templateUrl: '/modules/core/views/templates/os-datepicker.client.template.html',
                replace: true,
                restrict: 'E',
                scope: {
                    model: '=',
                    dpClass: '@?',
                    required: '=?',
                    initialMode: '@?'
                },
                controller: function($scope, $element, $attrs, $transclude) {
                    this.required = this.required === undefined && $attrs.required !== undefined || !!this.required;

                    this.format = 'dd/MM/yyyy';

                    this.dateOptions = {
                        formatYear: 'yyyy',
                        startingDay: 1,
                        showWeeks: false
                    };

                    this.initialMode = this.mode || 'year';
                    console.log('Initial mode: %o', this.initialMode);

                    this.toggle = function($event) {
                        $event.preventDefault();
                        $event.stopPropagation();

                        this.opened = !this.opened;
                    };
                },
                controllerAs: 'ctrl',
                bindToController: true
            };
        }]);


})();
