(function() {
    'use strict';

    function ProfileCtrl($scope, reviewService, experienceService, userService, modalService, cameraService, $ionicModal, $ionicActionSheet, registerService) {
        var vm = this;

        vm.modal = modalService;
        vm.profileData = userService.getUserData();


        // THIS IS NEEDED ONLY FOR DEVELOPMENT
        // Function below is needed only for cases,
        // when you are loading state skipping the login stage.
        // For example directly loading profile state,
        // IN THE REGULAR APP WORKFLOW userService will already contain
        // all needed profile data.

        (function () {
            var userPromise = userService.getUserData();
            if(userPromise.then){
                userPromise.then(function (data) {
                    vm.profileData = data;
                })
            }
        })();


        vm.reviews = [];
        vm.experience = [];


        vm.showModal = function (modalName) {
            modalService.show(modalName);
        };

        vm.closeModal = function (modalName) {
            modalService.close(modalName);
        };

        vm.getReviews = function () {
            reviewService
                .getUserReviews()
                .then(function (response) {
                    console.log('Reviews List', response);
                    vm.reviews = response.data;
                })
        };
        vm.getExperience = function () {
            experienceService
                .getUserExperience()
                .then(function (response) {
                    console.log('Experience List', response);
                    vm.experience = response.data;
                })
        };
        vm.postReview = function (id, review) {
            reviewService
                .postReviewForProfile(id, review)
                .then(function (response) {
                    console.log('posted response', response);
                })
        };
        vm.postExperience = function (experience) {
            experienceService
                .postUserExperience(experience)
                .then(function (response) {
                    console.log('posted experience', response);
                })
        };

        //var sampleReview = {
        //    user: '55b27b1893e595310272f1d0',
        //    reviewer: null,
        //    name: 'Anna S',
        //    email: 'Anna@gmail.com',
        //    title: 'On Time!',
        //    text: 'Have been working together for more then 7 years now!',
        //    rating: 4,
        //    created: '2014-12-04T00:59:41.249Z',
        //    modified: '2015-01-06T00:59:41.249Z'
        //};
        //

        //var experienceSample = {
        //    title: 'Aston Martin Driving Experience',
        //    description: 'Ever fancied yourself as the next James Bond? Why not have a go at a Trackdays.co.uk Aston Martin Driving Experience at one of our many venues across the UK?',
        //    startDate: '2007-09-18',
        //    endDate: '2008-02-12',
        //    location: 'San Francisco, CA'
        //};
        //vm.postExperience(experienceSample);

        vm.getReviews();
        vm.getExperience();

        vm.endorsementsMap = {
            T : {
                title: 'Double/Triple Trailer',
                ico: 'ico-doubletraileractive'
            },
            P : {
                title: 'Passenger Vehicle',
                ico: 'ico-passengeractive'
            },
            S : {
                title: 'School Bus',
                ico: 'ico-doubletraileractive'
            },
            N : {
                title: 'Tank Truck',
                ico: 'ico-tankvehicleactive'
            },
            H : {
                title: 'Hazardous Materials',
                ico: 'ico-hazardousmaterialsactive'
            },
            X : {
                title: 'Tank + Hazardous',
                ico: 'ico-tankhazardousactive'
            }
        };
        //
        //vm.me = (function(){
        //    registerService.me()
        //        .then(function (response) {
        //            if(response.success) {
        //                vm.profileData = response.message.data;
        //                console.log('-=-=-=-=-=-=-=-=-=-=-=-=- USER  OBJECT -=-=-=-=-=-=-=-=-=-=-=-=-', vm.profileData);
        //            }
        //        });
        //})();

        //test data
        vm.rawImage='data:image/jpeg;base64,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';

        vm.croppedImage = '';
        vm.finalImage = '';

        $ionicModal.fromTemplateUrl('modules/signup/templates/edit-avatar.html', function($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            scope: $scope,
            backdropClickToClose: false,
            animation: 'slide-in-up'
        });

        vm.avatarShot = function() {
            console.log('avatarShot');

            $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a photo from camera' },
                    { text: 'Take a photo from album' }
                ],
                titleText: 'Choose your photo',
                cancelText: 'Cancel',
                cancel: function() {
                },
                buttonClicked: function(index) {
                    switch (index){
                        case 0:
                            console.log("Take a photo");
                            takePhoto(1);
                            break;
                        case 1:
                            console.log("Take photo from album");
                            takePhoto(0);
                            break;
                    }
                    return true;
                }
            });
        }


        var takePhoto = function(type){
            //for test
             $scope.modal.show();

            var options = {
                quality: 80,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: type,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 500,
                targetHeight: 1000,
                correctOrientation:true,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
            cameraService.getPicture(options).then(function(imageData) {
                if(imageData) {
                    $scope.modal.show().then(function(){
                        vm.rawImage="data:image/jpeg;base64," + imageData;
                    });

                }
            }, function(err) {
                console.log("ERROR! "+err);

            });
        }

        $scope.modalHide = function(){
            $scope.modal.hide().then(function(){
                vm.finalImage = vm.croppedImage;

                var dataProps = {
                    props:{
                        avatar: vm.finalImage
                    }
                };
                var userPromise = userService.updateUserData(dataProps);
                if(userPromise.then){
                    userPromise.then(function (profileData) {
                        vm.profileData = profileData;
                    })
                }
            })
        }
    }

    ProfileCtrl.$inject = ['$scope', 'reviewService', 'experienceService', 'userService', 'modalService', 'cameraService', '$ionicModal', '$ionicActionSheet', 'registerService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
