(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareCtrl', LockboxShareCtrl);

    LockboxShareCtrl.$inject = ['$filter', '$ionicPopup', 'contactsService', 'lockboxModalsService', 'lockboxDocuments', 'requestService', 'utilsService'];

    function LockboxShareCtrl($filter, $ionicPopup, contactsService,  lockboxModalsService, lockboxDocuments, requestService, utilsService) {

        var vm = this;
        vm.selectedContact = {};

        vm.cancel = cancel;
        vm.addDocumentsToShare = addDocumentsToShare;
        vm.shareDocuments = shareDocuments;
        vm.showContactsModal = showContactsModal;

        init();

        function init() {
            vm.documents = [];
            vm.contact = {};
            vm.shareStep = 1;
            return getDocs();
        }

        function showContactsModal () {
            contactsService
                .retrieveContacts()
                .then(function () {
                    lockboxModalsService
                        .showLockboxShareContactModal()
                        .then(function (selectedContact) {
                            vm.contact = selectedContact;
                        });
                });
        }

        function getDocs() {
            return lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);
                    vm.documents = response.data instanceof Array && response.data.length ? response.data : lockboxDocuments.getStubDocuments();
                });
        }

        function cancel() {
            var self = this;
            vm.closeModal(null);
            self.shareStep = 1;
        }

        function addDocumentsToShare () {
            var filter = $filter('getChecked'),
                selectedDocs = filter(vm.documents);

            if(!selectedDocs.length){
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Please select documents you would like to share'
                })
            }

            vm.docsToShare = selectedDocs;
            vm.shareStep = 2;
        }


        function shareDocuments () {
            var requestObj = {},
                serializedReqObj;

            requestObj.requestType = 'shareRequest';

            requestObj.contactInfo = getModifiedContactInfo(vm.contact);
            requestObj.text = vm.contact.message || '';
            requestObj.contents = {
                documents: vm.docsToShare
            };

            serializedReqObj = utilsService.serialize(requestObj);

            requestService
                .createRequest(serializedReqObj)
                .then(function (response) {
                    showSuccessPopup(response);
                });

            function getModifiedContactInfo (contactInfo) {
                if(!contactInfo) return;

                var contact = {};

                angular.copy(contactInfo, contact);

                if(contact.checked) delete contact.checked;
                if(contact.message) delete contact.message;

                return contact;
            }

            function showSuccessPopup () {
                var config = {},
                    displayName = requestObj.contactInfo.displayName;

                config.title = 'Success!';
                config.template = displayName ? 'Your profile has been shared with ' + displayName : 'Your profile has been shared';

                var popup = $ionicPopup.alert(config);

                popup.then(function () {
                    vm.cancel();
                });
            }
        }

    }
})();
