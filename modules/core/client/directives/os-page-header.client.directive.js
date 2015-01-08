(function() {
    function PageHeaderDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/core/views/templates/os-page-header.client.template.html',
            scope: {
                title: '@',
                editSref: '@?',
                showEdit: '=?',
                btnShow: '=?',
                btnText: '@?',
                btnSref: '@?',
                level: '@?'
            },
            transclude: true,
            restrict: 'E',
            controller: ['$transclude', function (transclude) {
                var dm = this;

                dm.btnShow = typeof this.btnShow === 'undefined' ? true : this.btnShow;
                dm.showEdit = typeof this.showEdit === 'undefined' ? false : this.showEdit;

                dm.hover = false;
                dm.includeTransclude = !!transclude().contents() && transclude().contents().length > 0;
            }],
            controllerAs: 'dm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('core')
        .directive('osPageHeader', PageHeaderDirective);

})();
