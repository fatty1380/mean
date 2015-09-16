(function () {
    'use strict';

    angular
        .module('messages')
        .controller('MessagesCtrl', MessagesCtrl);

    MessagesCtrl.$inject = ['$rootScope', '$scope', 'messageService', 'messageModalsService', '$ionicLoading', 'userService', 'recipientChat'];

    function MessagesCtrl ($rootScope, $scope, messageService, messageModalsService, $ionicLoading, userService, recipientChat) {

        var vm  = this;
        vm.messages = [];
        vm.chats = [];

        vm.openChatDetails = openChatDetails;

        $rootScope.$on("clear", function () {
            console.log('MessagesCtrl clear');
            vm.messages = [];
            vm.chats = [];
        });

        $scope.$on('$ionicView.enter', function () {
            getChats();
        });

        if (!!recipientChat) {
            console.log('Initializing MessagesCtrl with Specific Chat', recipientChat);
            showChatDetailsModal(recipientChat);
        }
        //getChats();


        //get my avatar
       /* var userData = userService.getUserData();
        if(userData.then) {
            userData.then(function(data){
                console.log('vm.profileData ',data);
                vm.profileData = data;
            }, function(){
                console.log("userService error");
            });
        }else{
            vm.profileData =  userData;
        }*/

        function loadProfileAvatars() {

        }

        function openChatDetails(object) {
            console.log('openChatDetails() ',object.recipientName);
            showChatDetailsModal(object);
        }

        function showChatDetailsModal(parameters) {
            messageModalsService
                .showNewMassageModal(parameters)
                .then(function () {
                    getChats();
                },
                function (err) {
                    console.log(err);
                });
        }

        function getChats () {
            $ionicLoading.show({
                template: 'loading chats'
            });
            messageService
                .getChats()
                .then(function (res) {
                    $ionicLoading.hide();
                    console.log('GET CHATS SUCCESS ----- >>>', res);
                    vm.chats = res.data;
                    loadProfileAvatars();
                }, function (err) {
                    $ionicLoading.hide();
                    console.log('GET CHATS ERROR ----- >>>', err);
                });
        }
    }
})();
