(function () {
    'use strict';

    function LocationController($scope, $log) {
        var vm = this;

        vm.search = 'United States';
        vm.range = null;
        vm.precision = vm.precision || 'approximate';

        switch(vm.precision) {
            case 'approximate':
                vm.circle = true;
                vm.marker = false;
                vm.radMod = 1.25;
                break;
            case 'exact':
                vm.marker = true;
                vm.circle = false;
                vm.radMod = 1;
                break;
            default:
                vm.circle = true;
                vm.marker = false;
                vm.radMod = 1;

        }

        if (!vm.address && !!vm.addresses && !!vm.addresses.length) {
            vm.address = vm.addresses[0];
        }

        function getSearchString() {
            var str = '';
            vm.showCircle = vm.circle;
            vm.showMarker = vm.marker;
            vm.radiusMod = vm.radMod;

            //str = !!vm.address.streetAddresses ? vm.address.streetAddresses.join(' ').trim() : '';
            str += vm.address && !!vm.address.city ? (!!str ? ', ' : '') + vm.address.city : '';
            str += vm.address && !!vm.address.state ? (!!str ? ', ' : '') + vm.address.state : '';

            if (!str.trim()) {
                console.log('Mapping to string: %s', str.trim());
                if (vm.address && vm.address.zipCode) {
                    str = vm.address.zipCode;
                    vm.radiusMod = vm.radMod * 1.5;
                }
                else if (!!vm.zipCode) {
                    str = vm.zipCode;
                    vm.radiusMod = vm.radMod * 2;
                    vm.showCircle = true;
                    vm.showMarker = false;
                }
                else {
                    str = 'United States';
                    vm.showCircle = false;
                    vm.showMarker = false;
                }

            } else {
                vm.radiusMod = vm.radMod;
            }

            $log.debug('new search : %s', str);

            return str.trim();
        }


        vm.geoCode = function (maps) {
            if (vm.search && vm.search.length > 0) {
                if (!vm.geocoder) {
                    vm.geocoder = new vm.gmaps.Geocoder();
                }
                vm.geocoder.geocode({
                    'address': vm.search
                }, function (results, status) {
                    if (status === vm.gmaps.GeocoderStatus.OK) {
                        $log.info('[LocationCtrl] OK - %d results. First location: %o', results.length, results[0]);
                        var result = results[0];
                        var loc = result.geometry.location;
                        vm.search = result.formatted_address; // jshint ignore:line
                        vm.gotoLocation(loc, result.geometry.viewport);

                    } else {
                        alert('Sorry, this search produced no results.');
                    }
                });
            }
        };

        vm.gotoLocation = function (center, viewport) {

            vm.map.setCenter(center);

            var r;

            if (!!viewport) {
                vm.map.fitBounds(viewport);

                r = vm.radiusMod * Math.max(
                    google.maps.geometry.spherical.computeDistanceBetween(viewport.getSouthWest(), viewport.getCenter()),
                    google.maps.geometry.spherical.computeDistanceBetween(viewport.getNorthEast(), viewport.getCenter())
                );
            }

            if (!!r && vm.showCircle) {
                vm.range = new google.maps.Circle({
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.5,
                    strokeWeight: 2,
                    fillColor: '#0000FF',
                    fillOpacity: 0.25,
                    center: viewport.getCenter(),
                    map: vm.map,
                    radius: r
                });
            }

            if(vm.showMarker) {
                vm.mapMarker = new google.maps.Marker({
                    position: center,
                    map: vm.map
                });
            }
        };


        $scope.$on('mapInitialized', function (event, map) {
            vm.map = map;
            vm.gmaps = $scope.google.maps;

            vm.search = getSearchString();

            vm.geoCode();
        });

        $scope.$watch('vm.address', processChange);
        $scope.$watch('vm.address.zipCode', processChange);
        $scope.$watch('vm.address.city', processChange);
        $scope.$watch('vm.address.state', processChange);
        $scope.$watch('vm.zipCode', processChange);


        function processChange(newVal, oldVal, scope) {
            if (newVal !== oldVal) {

                var search = getSearchString();

                if (vm.search !== search) {
                    vm.search = search;

                    if (vm.range) {
                        vm.range.setMap(null);
                    }

                    if(!!vm.mapMarker) {
                        vm.mapMarker.setMap(null);
                    }

                    vm.geoCode();
                }
            }
        }
    }

    LocationController.$inject = ['$scope', '$log'];

    angular.module('location')
        .controller('LocationController', LocationController);
})();
