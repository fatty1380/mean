(function () {
    'use strict';
    
    /**
     * showRequestReviewModal
     * template: modules/account/child_modules/profile/templates/profile-request.html
     */

    angular
        .module('account')
        .controller('ProfileRequestReviewCtrl', ProfileRequestReviewCtrl);

    ProfileRequestReviewCtrl.$inject = ['userService', 'reviewService', 'utilsService', 'LoadingService'];

    function ProfileRequestReviewCtrl(userService, reviewService, utilsService, LoadingService) {
        var vm = this;
        vm.profileData = userService.profileData;
        vm.contact = {};
        vm.message = '';

        vm.sendRequest = sendRequest;

        function sendRequest() {
            console.log(vm.contact);
            var data = {
                contactInfo: vm.contact,
                text: vm.message,
                requestType: 'reviewRequest'
            };

            if (_.isEmpty(vm.contact) || _.isEmpty(vm.contact.email) && _.isEmpty(vm.contact.phone)) {
                LoadingService.showLoader('Please enter an email address or phone number');
                return;
            }

            reviewService
                .createRequest(data)
                .then(function (resp) {
                    LoadingService.showSuccess('<h3>Success!</h3> Your request has been sent');

                    console.log(resp);
                    vm.contact = {};
                    vm.message = '';
                    
                    return vm.closeModal(resp.data);
                })
                .catch(function (resp) {
                    if (resp.data) {
                        LoadingService.showFailure('Unable to Request at this time. <br>Please try again later');
                    }
                });
        }
    }
})();
