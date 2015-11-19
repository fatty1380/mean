(function () {
    'use strict';

    angular
        .module('signup')
        .controller('TrailersCtrl', TrailersCtrl)

    TrailersCtrl.$inject = ['$scope', '$state', 'registerService', 'LoadingService', '$ionicPopup'];

    function TrailersCtrl($scope, $state, registerService, LoadingService, $ionicPopup) {
        var vm = this;
        vm.newTrailer = '';

        vm.addTrailer = addTrailer;
        vm.continue = goNext;
        vm.trailers = getTrailers();

        function addTrailer() {
            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTrailer" autofocus>',
                title: 'Please enter a trailer type',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            vm.newTrailer = '';
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function (e) {
                            if (!vm.newTrailer) {
                                e.preventDefault();
                            } else {
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
                registerService.userProps.trailer = getNameKeys(vm.trailers);
                LoadingService.showLoader('Saving');

                return registerService.updateUserProps({ trailer: getNameKeys(vm.trailers) })
                    .then(function (response) {
                        if (response.success) {
                            logger.debug('Trailers: Saved Successfully', response.message);
                        } else {
                            logger.error('Trailers: Save Failed', response.message);
                        }

                        $state.go('signup-friends');
                    })
                    .finally(function () {
                        LoadingService.hide();
                    });
            }

            $state.go('signup-friends');
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

        function showPopup(response) {
            var alertPopup = $ionicPopup.alert({
                title: response.title || 'title',
                template: response || 'no message'
            });
            alertPopup.then(function (res) { });
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
