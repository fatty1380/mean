(function () {
    'use strict';

    angular
        .module('company')
        .controller('CompanyCtrl', CompanyCtrl);

    CompanyCtrl.$inject = ['$ionicLoading', '$ionicPopup', '$ionicHistory', '$state',
        'company', 'jobs', 'feed', 'userService', 'CompanyService'];

    function CompanyCtrl($ionicLoading, $ionicPopup, $ionicHistory, $state,
        company, jobs, feed, userService, CompanyService) {
        var vm = this;

        vm.follow = follow;
        vm.unfollow = unfollow;
        vm.goBack = goBack;


        initialize();
        
        /////////////////////////////////////////////////////////////////////////////////////

        function initialize() {

            if (_.isEmpty(company)) {
                $ionicLoading.show({ template: 'Not Found', duration: 2500 });
                return goBack();
            }

            vm.company = company;
            vm.jobs = jobs || [];
            vm.feed = feed || [];

            userService.getUserData().then(
                function (user) {
                    vm.isFollowing = _.contains(vm.company.followers || [], user.id);
                });


            $ionicLoading.hide();
        }

        function goBack() {
            if (_.isEmpty($ionicHistory.backTitle())) {
                debugger;
                return $state.go('account.activity');
            }

            return $ionicHistory.goBack();
        }

        function follow() {
            CompanyService.follow(vm.company.id)
                .then(function success(result) {
                    $ionicLoading.show({
                        template: '<i class="icon ion-checkmark"></i><br>Following',
                        duration: 1500
                    })
                    vm.isFollowing = true;
                });
        }

        function unfollow() {
            CompanyService.unfollow(vm.company.id).then(
                function success(result) {
                    $ionicLoading.show({
                        template: '<i class="icon ion-close"></i>',
                        duration: 1500
                    })
                    vm.isFollowing = false;
                });
        }
    }


})();
