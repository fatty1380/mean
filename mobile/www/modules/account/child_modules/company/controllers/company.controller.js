(function () {
    'use strict';

    angular
        .module('company')
        .controller('CompanyCtrl', CompanyCtrl);

    CompanyCtrl.$inject = ['$ionicLoading', '$ionicPopup', '$ionicHistory', '$state',
        'company', 'jobs', 'feed', 'CompanyService'];
        
    function CompanyCtrl($ionicLoading, $ionicPopup, $ionicHistory, $state,
        company, jobs, feed, CompanyService) {
        var vm = this;
        
        vm.follow = follow;
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
            $ionicLoading.show({
                template: '<i class="icon ion-checkmark"></i><br>Following',
                duration: 2000
            })
        }
    }


})();
