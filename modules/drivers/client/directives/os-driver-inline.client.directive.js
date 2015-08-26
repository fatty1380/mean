(function() {
    'use strict';

    function OsDriverInlineView() {
        return {
            priority: 0,
            templateUrl: '/modules/applications/views/templates/applicant-normal.client.template.html',
            replace: true,
            transclude: true,
            restrict: 'E',
            scope: {
                driver: '=model',
                profile: '=?',
                application: '=?'
            },
            controller: ['$q', 'Profiles', function($q, Profiles) {
                var vm = this;

                vm.profile = vm.profile || Profiles.getUserForDriver(vm.driver);
                vm.license = !!vm.driver.licenses && vm.driver.licenses.length ? vm.driver.licenses[0] : null;
            }],
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function OsProfileHeader() {
        return {
            templateUrl: '/modules/drivers/views/templates/driver-badge.client.template.html',
            restrict: 'E',
            scope : {
                profile: '=model',
                driver: '=?',
                pictureEditFn : '&?',
                canEdit: '=?'
            },
            link: function(scope, elem, attrs) {
                var vm = scope.vm;

                vm.driver = vm.driver || vm.profile.driver;
                debugger;
                vm.pictureUrl = vm.profile.props && vm.profile.props.avatar || vm.profile.profileImageURL;
                vm.subTitle = vm.profile.type;

                vm.canEdit = _.isUndefined(vm.canEdit) ? false : vm.canEdit;
                vm.editSref = 'settings.profile';
                vm.editPicSref = 'settings.picture';
                vm.editPicFn = function () {
                    if (!!angular.isFunction(attrs.pictureEditFn)) {
                        return vm.pictureEditFn();
                    }
                };

            },
            controller: function() {
                var vm = this;
                vm.unknown = 'is this thing on?';
            },
            controllerAs: 'vm',
            bindToController: true
        };
    }



    OsDriverInlineView.$inject = [];

    angular
        .module('drivers')
        .directive('osDriverInline', OsDriverInlineView)
    .directive('osProfileHeader', OsProfileHeader);
})();
