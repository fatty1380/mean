(function () {
    'use strict';

    function PageHeaderDirective() {
        var ddo;
        ddo = {
            templateUrl: '/modules/core/views/templates/os-page-header.client.template.html',
            scope: {
                title: '@',
                subTitle: '@?',
                showEdit: '=?',
                btnShow: '=?',
                btnText: '@?',
                btnSref: '@?',
                editSref: '@?',
                level: '@?',
                pictureUrl: '=?',
                editPicSref: '@?',
                pictureEditFn: '&?',
                backBtnText: '@?',
                backBtnFn: '&?',
                driver: '=?'
            },
            transclude: true,
            restrict: 'E',
            controller: ['$transclude', '$log', '$state', '$attrs', function (transclude, $log, $state, $attrs) {
                var vm = this;

                vm.btnShow = typeof this.btnShow === 'undefined' ? true : this.btnShow;
                vm.showEdit = typeof this.showEdit === 'undefined' ? false : this.showEdit;
                vm.showPicEdit = (!!angular.isDefined($attrs.pictureEditFn) || !!angular.isDefined($attrs.editPicSref)) && vm.showEdit;

                vm.showBackBtn = angular.isDefined($attrs.backBtnFn) && !!vm.backBtnText;

                vm.hover = false;
                vm.includeTransclude = !!transclude().contents() && transclude().contents().length > 0;

                vm.showHeader = !!vm.subTitle || !!vm.editSref || vm.showBackBtn || vm.btnShow && (!!vm.btnText && !!vm.btnSref);

                vm.editPicFn = function () {
                    if (!!angular.isDefined($attrs.pictureEditFn)) {
                        $log.debug('calling pictureEditFn');
                        return vm.pictureEditFn();
                    }
                };

                vm.goBackFn = function () {
                    if (!!angular.isDefined($attrs.backBtnFn)) {
                        $log.debug('calling backBtnFn');
                        return vm.backBtnFn();
                    }
                };
                
                vm.filterEndorsements = function(license) {
                    return _.compact(_.keys(license.endorsements).map(function(item) { return (license.endorsements[item]) ? item : null; })) || [];
                };
            }],
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('core')
        .directive('osPageHeader', PageHeaderDirective);

})();
