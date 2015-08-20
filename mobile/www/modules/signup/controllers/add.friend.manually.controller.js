(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddFriendManuallyCtrl', AddFriendManuallyCtrl);

    AddFriendManuallyCtrl.$inject = ['$state'];

    function AddFriendManuallyCtrl($state) {
        var vm = this;
    }

})();
