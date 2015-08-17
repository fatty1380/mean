(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['activityModalsService','activityService', '$ionicLoading'];

    function ActivityCtrl(activityModalsService, activityService, $ionicLoading) {
        var vm = this;

        //vm.feed = activityService.feed;

        $ionicLoading.show({
            template: 'loading feed'
        });

        activityService.feed().then(function(result) {
            $ionicLoading.hide();
            vm.feed = result;
            console.log(vm.feed);
        });

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
            draggable: true
        });


        vm.showAddActivityModal = function () {
            activityModalsService
                .showAddActivityModal()
                .then(function (res) {
                    console.log(res);
                }, function (err) {
                    console.log(err);
                })
        };

        vm.showActivityDetailsModal = function (entry) {
            activityModalsService
                .showActivityDetailsModal({entry: entry})
                .then(function (res) {
                    console.log(res);
                }, function (err) {
                    console.log(err);
                })
        };

    }

})();




/*
(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['modalService','activityService', 'activityDetailsService', '$ionicLoading', '$scope', '$compile'];

    function ActivityCtrl(modalService, activityService, activityDetailsService, $ionicLoading, $scope, $compile) {
        var vm = this;

        vm.showModal = showModal;
        vm.closeModal = closeModal;
        vm.where = '';
        vm.num = 1;
        //vm.map = { center: { latitude: 39.904903, longitude: -75.230039 }, zoom: 2 };

        $ionicLoading.show({
            template: 'loading feed'
        });

        activityService.feed().then(function(result) {
            $ionicLoading.hide();
            vm.feed = result;
        });

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
            draggable: true
        });

        function initialize() {
            getPlaceName(latLng);

            // Add dragging event listeners.
            google.maps.event.addListener(marker, 'touchstart', function() {
                console.log('dragstart');
            });

            google.maps.event.addListener(marker, 'drag', function() {
            });

            google.maps.event.addDomListener(map, 'click', function(e) {
                var latlng = { lat: e.latLng.G, lng: e.latLng.K };
                getPlaceName(latlng);
                vm.loc = latlng;
                console.log(vm.loc);
            });
            google.maps.event.addDomListener(map, 'touchstart', function() {
                window.alert('Map was touchstart!');
            });

            google.maps.event.addListener(marker, 'touchend', function() {
                console.log('dragend');
            });

        }

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

                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        }

        initialize();

        function showModal(modalName, entry) {
            if(entry){
                activityDetailsService.setEntry(entry);
            }
            modalService.show(modalName);
        }

        function closeModal(modalName) {
            modalService.close(modalName);
        }
    }
})();
*/
