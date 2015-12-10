(function () {
    'use strict';

    angular
        .module('signup')
        .controller('TrucksCtrl', TrucksCtrl)

    TrucksCtrl.$inject = ['$scope', '$state', '$cordovaGoogleAnalytics', '$ionicPopup', '$ionicHistory',
        'userService', 'LoadingService'];

    function TrucksCtrl($scope, $state, $cordovaGoogleAnalytics, $ionicPopup, $ionicHistory,
        userService, LoadingService) {

        var vm = this;
        vm.newTruck = '';
        vm.currentTruck = '';

        vm.addTruck = addTruck;
        vm.continueToTrailers = goNext;
        vm.goBack = goBack;
        vm.trucks = getTrucks();

        function addTruck() {
            var then = Date.now();
            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTruck" autofocus>',
                title: 'Please enter your truck manufacturer',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            vm.newTruck = '';
                            $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'addCustom:cancel');
                            $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trucks', 'addCustom:cancel');
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function (e) {
                            if (!vm.newTruck) {
                                e.preventDefault();
                                $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'addCustom:empty');
                                $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trucks', 'addCustom:empty');
                            } else {
                                $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'addCustom');
                                $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trucks', 'addCustom');
                                vm.trucks.push({ name: vm.newTruck, logoClass: '' });
                                vm.currentTruck = vm.newTruck;
                                vm.newTruck = '';
                                debugger;
                                return vm.currentTruck;
                            }
                        }
                    }
                ]
            });
        }


        function goNext(isSave) {
            if (isSave) {
                var then = Date.now();
                LoadingService.showLoader('Saving Truck');

                return userService.updateUserProps({ truck: vm.currentTruck })
                    .then(function success(propsResponse) {
                        $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'save');
                        $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trucks', 'save');
                        logger.debug('Trucks: Saved Successfully');
                    })
                    .catch(function fail(err) {
                        $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'err: ' + err);
                        $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trucks', 'err: ' + err);
                        logger.error('Trucks: Save Failed', err);
                    })
                    .finally(function () {
                        $state.go('signup.trailers');
                        LoadingService.hide();
                    });
            }

            $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'skip');
            $state.go('signup.trailers');
        }
        
        function goBack() {
            if (_.isEmpty($ionicHistory.backTitle())) {
                return $state.go('signup.engagement');
            }

            return $ionicHistory.goBack();
        }

        function getTrucks() {
            return TRUCKS;
        }
    }


    var TRUCKS = [
        { name: 'Peterbilt', logoClass: 'ico ico-peterbilt-logo' },
        { name: 'International', logoClass: 'ico ico-international-logo' },
        { name: 'Freightliner', logoClass: 'ico ico-freightliner-logo' },
        { name: 'Mack Trucks', logoClass: 'ico ico-mack-logo' },
        { name: 'Kenworth', logoClass: 'ico ico-kenworth-logo' },
        { name: 'Volvo', logoClass: 'ico ico-volvo-logo' }
    ];
})();
