(function () {
    'use strict';

    angular
        .module('company')
        .controller('CompanyCtrl', CompanyCtrl);

    CompanyCtrl.$inject = ['$ionicPopup', '$ionicHistory', '$state', '$sce',
        'company', 'jobs', 'feed', 'userService', 'LoadingService', 'CompanyService'];

    function CompanyCtrl( $ionicPopup, $ionicHistory, $state, $sce,
        company, jobs, feed, userService, LoadingService, CompanyService) {
        var vm = this;

        vm.follow = follow;
        vm.unfollow = unfollow;
        vm.goBack = goBack;
        vm.trust = trustMe;

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
            var backView = $ionicHistory.backView();
            
            if (_.isEmpty(backView) || _.isEmpty(backView.stateName)) {
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
        
        function trustMe(html) {
            return $sce.trustAsHtml(html.replace(/\<br\>/gi, ' '));
        }
    }


})();
