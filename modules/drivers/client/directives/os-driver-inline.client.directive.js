(function () {
    'use strict';



    angular
        .module('drivers')
        .directive('osDriverInline', OsDriverInlineView)
        .directive('osProfileHeader', OsProfileHeader);

    OsDriverInlineView.$inject = [];
    function OsDriverInlineView() {
        return {
            priority: 0,
            templateUrl: '/modules/applications/views/templates/applicant-normal.client.template.html',
            replace: true,
            transclude: true,
            restrict: 'E',
            scope: {
                profile: '=model',
                application: '=?'
            },
            controller: ['$q', 'Profiles', function ($q, Profiles) {
                var vm = this;

                vm.applicant = vm.profile;
            }],
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function OsProfileHeader() {
        return {
            templateUrl: '/modules/drivers/views/templates/driver-badge.client.template.html',
            restrict: 'E',
            scope: {
                profile: '=model',
                pictureEditFn: '&?',
                canEdit: '=?'
            },
            link: function (scope, elem, attrs) {
                var vm = scope.vm;
                
                if (_.isEmpty(vm.profile)) {
                    return;
                }
                
                vm.pictureUrl = vm.profile.profileImageURL; //vm.profile.props && vm.profile.props.avatar || 
                vm.subTitle = vm.profile.handle || vm.profile.type;

                vm.canEdit = _.isUndefined(vm.canEdit) ? false : vm.canEdit;
                vm.editSref = 'settings.profile';
                vm.editPicSref = 'settings.picture';
                vm.editPicFn = function () {
                    if (!!angular.isFunction(attrs.pictureEditFn)) {
                        return vm.pictureEditFn();
                    }
                };

            },
            controller: function () {
                var vm = this;
            },
            controllerAs: 'vm',
            bindToController: true
        };
    }


})();
