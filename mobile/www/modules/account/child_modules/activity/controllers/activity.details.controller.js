(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityDetailsCtrl', ActivityDetailsCtrl);

    ActivityDetailsCtrl.$inject = ['parameters', 'activityService', 'activityModalsService', '$timeout', '$ionicScrollDelegate'];

    function ActivityDetailsCtrl(parameters, activityService, activityModalsService, $timeout, $ionicScrollDelegate) {
        angular.element(document).ready(initMap);

        var vm = this;
        var map = null;
        var marker = null;

        vm.distanceSinceLastPost = 'no data';
        vm.isInputVisible = false;
        vm.entry = parameters.entry;
        vm.comments = parameters.entry.comments;
        vm.close = close;
        vm.likeActivity = likeActivity;
        vm.showInputs = showInputs;
        vm.createComment = createComment;
        vm.editComment = editComment;

        function initMap() {
            if (activityService.hasCoordinates(vm.entry)) {
                var latLng = new google.maps.LatLng(vm.entry.location.coordinates[0], vm.entry.location.coordinates[1]);
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 8,
                    center: latLng,
                    draggable: true,
                    sensor: true,
                    zoomControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    draggable: false
                });

                activityService.getPlaceName(latLng).then(
                    function (result) {
                    var infoWindow = new google.maps.InfoWindow({
                        content: result.formatted_address
                    });
                    infoWindow.setContent(result.formatted_address);
                    infoWindow.open(map, marker);
                }, function () {
                    console.log('getPlaceName error');
                });
            }
        }

        function scrollToBottom() {
            $timeout(function(){
                getDelegate('mainScroll').scrollBottom();
            }, 100);
        }

        //fix for scrollDelegate in modals
        function getDelegate(name){
            var instances = $ionicScrollDelegate.$getByHandle(name)._instances;
            return instances.filter(function(element) {
                return (element['$$delegateHandle'] == name);
            })[0];
        }

        function createComment() {
            console.log('vm.entry ',vm.entry);
            console.log('vm.message ',vm.message);

            var data = {
                text: vm.message
            };

            vm.message = '';
            vm.isInputVisible = false;

            activityService.postComment(vm.entry.id, data).then(
                function (result) {
                    console.log('result ',result);
                    if(result.data){
                        vm.comments = result.data;
                        scrollToBottom();
                    }
                }, function (resp) {
                    console.log(resp);
                });
        }

        function editComment(message) {
            console.log(vm.entry.user.id+' --- '+message.sender);
            //you can edit only your own comments
            if(vm.entry.user.id === message.sender) {
                showActivityCommentEditModal(message);
            }
        }

        function showInputs() {
            vm.isInputVisible = true;
        }

        function likeActivity() {
            console.log('likeActivity() ', vm.entry.id);
            activityService.likeActivity(vm.entry.id).then(function(result) {
                //update like in feed
                vm.entry.likes = result.data || [];
            },function(resp) {
                console.log(resp);
            });
        }

        function showActivityCommentEditModal(entry) {
            activityModalsService
                .showCommentEditModal({ entry: entry })
                .then(function (res) {
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        };

        function close() {
            vm.closeModal(vm.entry);
        }
    }
})();
