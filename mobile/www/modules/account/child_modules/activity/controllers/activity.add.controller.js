(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope','$timeout', 'activityService', '$ionicLoading', '$document'];

    function ActivityAddCtrl($scope, $timeout, activityService, $ionicLoading, $document) {
        var vm = this;

        vm.activity = {
            title : '',
            message : '',
            location : {
                type: 'Point',
                coordinates:[],
                created: ''
            }
        }

        vm.saveFeed = saveFeed;

        function saveFeed() {
            $ionicLoading.show({
                template: 'post feed'
            });
            activityService.postFeed(vm.activity).then(function(result) {
                $ionicLoading.hide();
                console.log(result);
                vm.close('activityAdd');
            });
        }

        //@TODO fix timeout to event
        $timeout( function(){
            var latLng = new google.maps.LatLng(39.904903, -75.230039);
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 3,
                center: latLng,
                draggable:true,
                sensor: true,
                zoomControl:true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            var marker = new google.maps.Marker({
                position: latLng,
                title: 'Point A',
                map: map,
                draggable: false
            });

            google.maps.event.addDomListener(map, 'click', function(e) {
                var latlng = { lat: e.latLng.G, lng: e.latLng.K };
                getPlaceName(latlng);
                vm.loc = latlng;
                vm.activity.location.coordinates = [e.latLng.G, e.latLng.K];
            });

            function getPlaceName(latlng) {
                if(!geocoder){
                    var geocoder = new google.maps.Geocoder;
                }
                geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            marker.setPosition(latlng);
                            vm.loc = latlng;
                            vm.where = results[1].formatted_address;
                            $scope.$digest();
                        } else {
                            window.alert('No results found');
                        }
                    } else {
                        window.alert('Geocoder failed due to: ' + status);
                    }
                });
            }
        }, 1500);

        vm.close = function () {
            $scope.closeModal(null);
        }
    }
})();
