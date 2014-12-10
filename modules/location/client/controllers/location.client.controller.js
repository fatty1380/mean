(function() {
    'use strict';

    function LocationController($scope, uiGmapGoogleMapApi) {
        // Do stuff with your $scope.
        // Note: Some of the directives require at least something to be defined originally!
        // e.g. $scope.markers = []
        $scope.search = $scope.zipCode || 'Phoenix, AZ';
        $scope.map = { zoom: 8 };

        $scope.geoCode = function(maps) {
            if ($scope.search && $scope.search.length > 0) {
                if (!this.geocoder) this.geocoder = new maps.Geocoder();
                this.geocoder.geocode({
                    'address': $scope.search
                }, function(results, status) {
                    if (status === maps.GeocoderStatus.OK) {
                        var loc = results[0].geometry.location;
                        $scope.search = results[0].formatted_address;
                        $scope.gotoLocation(loc.lat(), loc.lng());
                    } else {
                        alert('Sorry, this search produced no results.');
                    }
                });
            }
        };

        $scope.gotoLocation = function(lat, lon) {
            if ($scope.map.latitude !== lat || $scope.map.longitude !== lon) {
                $scope.map.center = {
                    latitude: lat,
                    longitude: lon
                };
                if (!$scope.$$phase) $scope.$apply('map');
            }
        };

        // uiGmapGoogleMapApi is a promise.
        // The 'then' callback function provides the google.maps object.
        uiGmapGoogleMapApi.then(function(maps) {
            $scope.googleVersion = maps.version;

            $scope.geoCode(maps);

        });
    }

    LocationController.$inject = ['$scope', 'uiGmapGoogleMapApi'];

    angular.module('location', ['uiGmapgoogle-maps'])
        .controller('LocationController', LocationController);
})();
