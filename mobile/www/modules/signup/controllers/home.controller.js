(function () {
    'use strict';

    var homeCtrl = function ($scope, $state, contactsService) {

        var vm = this;
        vm.activeSlide = 1;

        vm.data = {
            selectedContacts : []
        };

        vm.pickContact = function() {
            console.log("pickContact!!!  ");
            contactsService.pickContact().then(
                function(contact) {
                    vm.data.selectedContacts.push(contact);
                    console.log("Selected contacts=");
                    console.log(vm.data.selectedContacts);
                },
                function(failure) {
                    console.log("Bummer.  Failed to pick a contact");
                }
            );
        }
    };

    homeCtrl.$inject = ['$scope', '$state', 'contactsService'];

    angular
        .module('signup')
        .controller('homeCtrl', homeCtrl );

})();
