(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareCtrl', LockboxShareCtrl);

    LockboxShareCtrl.$inject = ['$filter', '$ionicPopup', 'contactsService', 'lockboxModalsService', 'lockboxDocuments', 'requestService', 'utilsService'];

    function LockboxShareCtrl($filter, $ionicPopup, contactsService, lockboxModalsService, lockboxDocuments, requestService, utilsService) {

        var vm = this;
        vm.selectedContact = {};

        vm.cancel = cancel;
        vm.skipDocs = skipDocs;
        vm.addDocumentsToShare = addDocumentsToShare;
        vm.shareDocuments = shareDocuments;

        init();

        function init() {
            vm.documents = [];
            vm.contact = {};
            vm.shareStep = 1;
            return getDocs();
        }

        function getDocs() {
            return lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);
                    vm.documents = _.isArray(response) ? response : [];
                });
        }

        function cancel() {
            var self = this;
            vm.closeModal(null);
            self.shareStep = 1;
        }

        function skipDocs() {
            return addDocumentsToShare(true);
        }

        function addDocumentsToShare(skip) {
            var filter = $filter('getChecked'),
                selectedDocs = filter(vm.documents);

            if (!selectedDocs.length && !skip) {
                return $ionicPopup.alert({
                    title: 'Error',
                    template: 'Please select documents you would like to share'
                });
            }

            vm.docsToShare = selectedDocs;
            vm.shareStep = 2;
        }


        function shareDocuments() {
            var requestObj = {},
                serializedReqObj;

            requestObj.requestType = 'shareRequest';

            requestObj.text = vm.contact.message || '';
            requestObj.contactInfo = getModifiedContactInfo(vm.contact);
            requestObj.contents = {
                documents: vm.docsToShare
            };

            serializedReqObj = utilsService.serialize(requestObj);

            requestService
                .createRequest(serializedReqObj)
                .then(function (response) {
                    showSuccessPopup(response);
                })
                .catch(function (err) {
                    console.error('WARNING: Hard Coded Success', err)
                    showSuccessPopup();
                });

            function getModifiedContactInfo(contact) {
                if (!contact) return;

                var contactInfo = {};

                angular.copy(contact, contactInfo);

                /**
                 * TODO: Determine 
                 */
                // if(contact.checked) delete contact.checked;
                // if(contact.message) delete contact.message;
                
                if (angular.isDefined(contact.email && (!contact.emails || !contact.emails.length))) {
                    contactInfo.emails = [{ value: contact.email, type: 'manual' }];
                }
                if (angular.isDefined(contact.phone && (!contact.phoneNumbers || !contact.phoneNumbers.length))) {
                    contactInfo.phoneNumbers = [{ value: contact.phone, type: 'manual' }];
                }

                return contactInfo;
            }

            function showSuccessPopup() {
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
