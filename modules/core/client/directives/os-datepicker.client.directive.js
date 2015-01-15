(function () {
    'use strict';
    var y = moment().year();

    function yearIsChill(d) {
        return (d.year() > y - 90 && d.year() < y + 20);
    }

    function getDate(model, format) {
        var t;
        if (!model || _.isEmpty(model)) {
            return '';
        }
        if ((t = moment(model, format)).isValid() && yearIsChill(t)) {
            return t;
        }

        if (typeof model === 'string') {
            var stripped = model.replace(/[^\d]/, '');

            if ((t = moment(stripped)).isValid() && yearIsChill(t)) {
                return t;
            }
            if ((t = moment(stripped, format)).isValid() && yearIsChill(t)) {
                return t;
            }

            if ((t = moment(stripped, 'MMDDYYYY')).isValid() && yearIsChill(t)) {
                return t;
            }

            if ((t = moment(stripped, 'YYYYMMDD')).isValid() && yearIsChill(t)) {
                return t;
            }
        }
        if ((t = moment(model)).isValid() && yearIsChill(t)) {
            return t;
        }

        return '';
    }

    function dpCtrl($element, $attrs, $scope, $log) {
        var vm = this;

        vm.format = vm.format || 'YYYY-MM-DD';
        vm.display = 'L'; // Locale Specific "Date" Format
        vm.displayFormat = vm.dformat || moment().format('L').replace(/\d{4}/, 'YYYY').replace(/\d{2}/, 'MM').replace(/\d{2}/, 'DD');
        vm.required = vm.required === undefined && $attrs.required !== undefined || !!vm.required;

        vm.mask = vm.dformat && vm.dformat.replace(/\w/g,'9') || '99/99/9999';
        console.log('got mask %s from %s', vm.mask, vm.dformat);

        var t = getDate(vm.model, vm.format);
        vm.shadow = !!t ? t.format(vm.displayFormat) : t;

        $scope.$watch('vm.shadow', function (newVal, oldVal) {
            if(newVal === oldVal) { return; }

            $log.info('[osDp] Change Detected, %o --> %o {%s}', oldVal, newVal, vm.format);

            var m;

            if (!!newVal) {
                if(moment.isMoment(newVal)) {
                    m = newVal;
                } else {
                    m = moment(newVal, vm.displayFormat);
                }

                if (m.isValid()) {
                    $log.info('[osDp] validDate %o --> %s', m, m.format(vm.format));
                    vm.model = m.format(vm.format);
                }
            }
        });
    }

    /** @ngdoc
     *   @description Self Contained Date Picker element for use on pages
     *   @param {object} model       The model to render and save @required
     *   @param {string} dp-class    CSS Class names to include @optional
     *   @param {boolean} required   Attribute indicating that the field is required
     *                               on the form. May be used as a standalone attibute
     *                               or as a boolean.
     */

    function dpDirective() {
        return {
            priority: 0,
            templateUrl: '/modules/core/views/templates/os-datepicker.client.template.html',
            replace: true,
            restrict: 'E',
            scope: {
                model: '=',
                format: '=?',
                dformat: '@?',
                isRequired : '=?',
                osName : '=?'
            },
            controller: dpCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function dpAltDirective() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {

                if (ngModel) { // Don't do anything unless we have a model

                    ngModel.$parsers.push(function (value) {
                        return value * 100;
                    });

                    ngModel.$formatters.push(function (value) {
                        return value / 100;
                    });

                }
            }
        };
    }

    angular.module('core').directive('dateInput', dpDirective);

})
();
