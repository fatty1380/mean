(function() {
    'use strict';

    angular
        .module('account')
        .controller('ManualFriendsAddCtrl', ManualFriendsAddCtrl);

    ManualFriendsAddCtrl.$inject = ['friendsService','$ionicScrollDelegate'];

    function ManualFriendsAddCtrl(friendsService, $ionicScrollDelegate) {
        var vm = this;

    }

})();
