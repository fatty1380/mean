(function() {
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
            controller: ['$transclude', '$log', '$state', function (transclude, $log, $state) {
                var dm = this;

                dm.btnShow = typeof this.btnShow === 'undefined' ? true : this.btnShow;
                dm.showEdit = typeof this.showEdit === 'undefined' ? false : this.showEdit;

                dm.hover = false;
                dm.includeTransclude = !!transclude().contents() && transclude().contents().length > 0;

                dm.editFn = function() {
                    debugger;

                    if(!!dm.pictureEditFn) {
                        $log.debug('calling pictureEditFn');
                        return dm.pictureEditFn();
                    }

                    if(!!dm.editSref) {
                        $log.debug('reouting to editSref `%s` for picture.', dm.editSref);
                        $state.go(dm.editSref);
                    }
                };
            }],
            controllerAs: 'dm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('core')
        .directive('osPageHeader', PageHeaderDirective);

})();
