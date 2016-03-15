(function() {
    'use strict';

    angular
        .module('signup')
        .controller('TrucksCtrl', TrucksCtrl);

    TrucksCtrl.$inject = ['$scope', '$state', '$cordovaGoogleAnalytics', '$ionicPopup', '$ionicHistory',
        'userService'];

    function TrucksCtrl($scope, $state, $cordovaGoogleAnalytics, $ionicPopup, $ionicHistory,
        UserService) {

        var vm = this;
        vm.newTruck = '';
        vm.currentTruck = '';
        vm.trucks = getTrucks();

        vm.addTruck = addTruck;
        vm.save = save;
        vm.activate = activate;

        function activate() {
            var props = UserService.profileData && UserService.profileData.props || {};
            vm.currentTruck = props.truck;
        }

        function addTruck() {
            var then = Date.now();
            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTruck" autofocus>',
                title: 'Please enter your truck manufacturer',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function() {
                            vm.newTruck = '';
                            $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'addCustom:cancel');
                            $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trucks', 'addCustom:cancel');
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function(e) {
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
                                return vm.currentTruck;
                            }
                        }
                    }
                ]
            });
        }

        function save() {
            var then = Date.now();

            return UserService.updateUserProps({ truck: vm.currentTruck })
                .then(function success(propsResponse) {
                    logger.debug('Saved User Props Successfully', propsResponse);
                    $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'save');
                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trucks', 'save');
                    logger.info('Trucks: Saved Successfully');

                    return propsResponse;
                })
                .catch(function fail(err) {
                    $cordovaGoogleAnalytics.trackEvent('signup', 'trucks', 'err: ' + err);
                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trucks', 'err: ' + err);
                    throw err;
                });
        }

        function getTrucks() {
            return [
                { name: 'Peterbilt', logoClass: 'ico ico-peterbilt-logo' },
                { name: 'International', logoClass: 'ico ico-international-logo' },
                { name: 'Freightliner', logoClass: 'ico ico-freightliner-logo' },
                { name: 'Mack Trucks', logoClass: 'ico ico-mack-logo' },
                { name: 'Kenworth', logoClass: 'ico ico-kenworth-logo' },
                { name: 'Volvo', logoClass: 'ico ico-volvo-logo' }
            ];
        }
    }
})();
