(function () {
    'use strict';

    angular
        .module('company')
        .controller('CompanyCtrl', CompanyCtrl);

    CompanyCtrl.$inject = ['LoadingService', '$ionicPopup', '$ionicHistory', '$state',
        'company', 'jobs', 'feed', 'userService', 'CompanyService'];

    function CompanyCtrl(LoadingService, $ionicPopup, $ionicHistory, $state,
        company, jobs, feed, userService, CompanyService) {
        var vm = this;

        vm.follow = follow;
        vm.unfollow = unfollow;
        vm.goBack = goBack;


        initialize();
        
        /////////////////////////////////////////////////////////////////////////////////////

        function initialize() {

            if (_.isEmpty(company)) {
                LoadingService.showAlert('Not Found');
                return goBack();
            }

            vm.company = company;
            vm.jobs = jobs || [];
            vm.feed = feed || [];

            userService.getUserData().then(
                function (user) {
                    vm.isFollowing = _.contains(vm.company.followers || [], user.id);
                });


            LoadingService.hide();
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
                    LoadingService.showSuccess('Following');
                    vm.isFollowing = true;
                });
        }

        function unfollow() {
            CompanyService.unfollow(vm.company.id).then(
                function success(result) {
                    LoadingService.showFailure('Unfollowed');
                    vm.isFollowing = false;
                });
        }
    }


})();
