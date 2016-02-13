(function () {
    'use strict';

    angular
        .module('signup')
        .factory('trailerService', trailerService);

    trailerService.$inject = ['$q', '$ionicPopup', '$rootScope'];

    function trailerService ($q, $ionicPopup, $rootScope) {
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

        function getTrailers () {
            var deferred = $q.defer();

            if (TRAILERS.length) deferred.resolve(TRAILERS);

            return deferred.promise;
        }

        function addTrailer () {
            var scope = $rootScope.$new();
            scope.vm = {};

            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTrailer" autofocus>',
                title: 'Please enter a trailer type',
                scope: scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            scope.vm.newTrailer = '';
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function (e) {
                            if (!scope.vm.newTrailer) {
                                e.preventDefault();
                            } else {
                                TRAILERS.push({ name: scope.vm.newTrailer, checked: true });
                                scope.vm.newTrailer = '';

                                return TRAILERS;
                            }
                        }
                    }
                ]
            });
        }

        return {
            getTrailers: getTrailers,
            addTrailer: addTrailer
        };

    }
})();


