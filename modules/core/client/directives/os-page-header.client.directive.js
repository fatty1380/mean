(function () {
    'use strict';

    function PageHeaderDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/core/views/templates/os-page-header.client.template.html',
            scope: {
                title: '@',
                subTitle: '@?',
                showEdit: '=?',
                btnShow: '=?',
                btnText: '@?',
                btnSref: '@?',
                level: '@?',
                pictureUrl: '=?',
                editSref: '@?',
                pictureEditFn: '&?'
            },
            transclude: true,
            restrict: 'E',
            controller: ['$transclude', '$log', '$state', '$attrs', function (transclude, $log, $state, $attrs) {
                var vm = this;

                vm.btnShow = typeof this.btnShow === 'undefined' ? true : this.btnShow;
                vm.showEdit = typeof this.showEdit === 'undefined' ? false : this.showEdit;

                vm.hover = false;
                vm.includeTransclude = !!transclude().contents() && transclude().contents().length > 0;

                vm.showHeader = !!vm.subTitle || !!vm.editSref || vm.btnShow && (!!vm.btnText && !!vm.btnSref);

                vm.editPicFn = function () {
                    if (!!angular.isDefined($attrs.pictureEditFn)) {
                        $log.debug('calling pictureEditFn');
                        return vm.pictureEditFn();
                    }
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
