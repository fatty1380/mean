(function () {
    'use strict';

    angular
        .module('signup')
        .controller('TrailersCtrl', TrailersCtrl)

    TrailersCtrl.$inject = ['$scope', '$state', '$cordovaGoogleAnalytics', '$ionicHistory', 'userService', 'LoadingService', '$ionicPopup'];

    function TrailersCtrl($scope, $state, $cordovaGoogleAnalytics, $ionicHistory, userService, LoadingService, $ionicPopup) {
        var vm = this;
        vm.newTrailer = '';

        vm.addTrailer = addTrailer;
        vm.goBack = goBack;
        vm.continue = goNext;
        vm.trailers = getTrailers();

        function addTrailer() {
            var then = Date.now();
            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTrailer" autofocus>',
                title: 'Please enter a trailer type',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            vm.newTrailer = '';
                            $cordovaGoogleAnalytics.trackEvent('signup', 'trailers', 'addCustom:cancel');
                            $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trailers', 'addCustom:cancel');
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function (e) {
                            if (!vm.newTrailer) {
                                e.preventDefault();
                                $cordovaGoogleAnalytics.trackEvent('signup', 'trailers', 'addCustom:empty');
                                $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trailers', 'addCustom:empty');
                            } else {
                                $cordovaGoogleAnalytics.trackEvent('signup', 'trailers', 'addCustom');
                                $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trailers', 'addCustom');
                                vm.trailers.push({ name: vm.newTrailer, checked: true });
                                vm.newTrailer = '';
                                return vm.newTrailer;
                            }
                        }
                    }
                ]
            });
        }

        function goNext(isSave) {
            if (isSave) {
                var then = Date.now();
                LoadingService.showLoader('Saving');

                return userService.updateUserProps({ trailer: getNameKeys(vm.trailers) })
                    .then(function success(propsResponse) {
                        $cordovaGoogleAnalytics.trackEvent('signup', 'trailers', 'save');
                        $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trailers', 'save');
                        logger.debug('Trailers: Saved Successfully');
                    })
                    .catch(function fail(err) {
                        $cordovaGoogleAnalytics.trackEvent('signup', 'trailers', 'err: ' + err);
                        $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trailers', 'err: ' + err);
                        logger.error('Trailers: Save Failed', err);
                    })
                    .finally(function () {
                        $state.go('signup.friends');
                        LoadingService.hide();
                    });
            }

            $cordovaGoogleAnalytics.trackEvent('signup', 'trailers', 'skip');
            $state.go('signup.friends');
        }
        
        
        function goBack() {
            var backView = $ionicHistory.backView();
            
            if (_.isEmpty(backView) || _.isEmpty(backView.stateName)) {
                return $state.go('signup.trucks');
            }

            return $ionicHistory.goBack();
        }

        function getNameKeys(obj) {
            var keys = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (obj[i].checked) {
                        keys.push(obj[i].name);
                    }
                }
            }
            return keys;
        }

        function getTrailers() {
            return TRAILERS;
        }
    };

    var TRAILERS = [
        { name: 'Box', checked: false },
        { name: 'Car Carrier', checked: false },
        { name: 'Curtain Sider', checked: false },
        { name: 'Drop Deck', checked: false },
        { name: 'Double Decker', checked: false },
        { name: 'Dry Bulk', checked: false },
        { name: 'Dump Truck', checked: false },
        { name: 'Flatbed', checked: false },
        { name: 'Hopper Bottom', checked: false },
        { name: 'Live Bottom', checked: false },
        { name: 'Livestock', checked: false },
        { name: 'Lowboy', checked: false },
        { name: 'Refrigerator Trailer', checked: false },
        { name: 'Refrigerator Tank', checked: false },
        { name: 'Sidelifter', checked: false },
        { name: 'Tank', checked: false }
    ];
})();
