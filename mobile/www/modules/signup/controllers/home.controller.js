(function () {
    'use strict';

    angular
        .module('signup')
        .controller('HomeCtrl', HomeCtrl );

    HomeCtrl.$inject = ['$state', 'userService'];
    
    function HomeCtrl($state, userService) {
        userService.getUserData().then(
            function (userData) {
                debugger;
                
                if (!!userData) {
                    console.log('Redirecting logged in user to home');
                    $state.go('account.profile');
                }
           }
       )
   };

})();
