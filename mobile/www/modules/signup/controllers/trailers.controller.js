(function () {
    'use strict';

    angular
        .module('signup')
        .controller('TrailersCtrl', TrailersCtrl);

    TrailersCtrl.$inject = ['$scope', '$state', '$cordovaGoogleAnalytics', '$ionicHistory', 'userService', '$ionicPopup'];

    function TrailersCtrl ($scope, $state, $cordovaGoogleAnalytics, $ionicHistory, UserService, $ionicPopup) {
        var vm = this;
        vm.newTrailer = '';

        vm.addTrailer = addTrailer;
        vm.trailers = getTrailers();
        vm.save = save;
        vm.activate = activate;

        function activate () {
            var props = UserService.profileData && UserService.profileData.props || {};

            if (_.isArray(props.trailer)) {
                _.map(props.trailer, function (t) {
                    var tmp = _.find(vm.trailers, { name: t });

                    if (tmp) {
                        tmp.checked = true;
                    }
                });
            }
        }

        function addTrailer () {
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

        function save () {
            var then = Date.now();

            return UserService.updateUserProps({ trailer: getNameKeys(vm.trailers) })
                .then(function success (propsResponse) {
                    $cordovaGoogleAnalytics.trackEvent('signup', 'trailers', 'save');
                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trailers', 'save');
                    logger.debug('Trailers: Saved Successfully');
                    return propsResponse;
                })
                .catch(function fail (err) {
                    $cordovaGoogleAnalytics.trackEvent('signup', 'trailers', 'err: ' + err);
                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'trailers', 'err: ' + err);
                    logger.error('Trailers: Save Failed', err);
                });
        }

        function getNameKeys (obj) {
            return _(obj).map(function (t) { return t.checked ? t.name : null; }).omit(_.isEmpty).values().value();
        }

        function getTrailers () {
            return [
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
        }
    }
})();
