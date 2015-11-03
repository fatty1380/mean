(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareCtrl', LockboxShareCtrl);

    LockboxShareCtrl.$inject = ['$filter', '$ionicPopup', 'parameters', 'contactsService', 'lockboxModalsService', 'lockboxDocuments', 'requestService', 'utilsService'];

    function LockboxShareCtrl($filter, $ionicPopup, parameters, contactsService, lockboxModalsService, lockboxDocuments, requestService, utilsService) {

        var vm = this;
        vm.selectedContact = {};
        vm.docsToShare = [];

        vm.back = back;
        vm.cancel = cancel;
        vm.skipDocs = skipDocs;
        vm.documents = parameters.documents;
        vm.addDocumentsToShare = addDocumentsToShare;
        vm.shareDocuments = shareDocuments;

        init();

        function init() {
            vm.contact = {};
            vm.shareStep = 1;

            return lockboxDocuments.checkAccess({ redirect: false, setNew: false })
                .then(function (isAccessible) {
                    vm.canAccess = isAccessible;

                    if (isAccessible) {
                        if (_.isEmpty(vm.documents)) {
                            console.log('Documents not included in parameters - looking up');
                            getDocs();
                        }
                        
                        return;
                    }

                    return skipDocs();
                })
                .catch(function fail(err) {
                    console.log('Failed to access lockbox due to `%s`', err);
                    vm.canAccess = false;
                });
        }

        function getDocs() {
            return lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);
                    vm.documents = _.isArray(response) ? response : [];
                });
        }

        function back() {
            vm.shareStep = 1;
        }

        function cancel() {
            var self = this;
            self.shareStep = 1;
            vm.closeModal(null);
        }

        function skipDocs() {
            return addDocumentsToShare(true);
        }

        function addDocumentsToShare(skip) {
            if (!skip) {
                var filter = $filter('getChecked'),
                    selectedDocs = filter(vm.documents);

                if (!selectedDocs.length && !skip) {
                    return $ionicPopup.alert({
                        title: 'Error',
                        template: 'Please select documents you would like to share'
                    });
                }

                vm.docsToShare = selectedDocs;
            } else {
                vm.docsToShare = [];
            }

            vm.shareStep = 2;
        }


        function shareDocuments() {
            var requestObj = {},
                serializedReqObj;

            if (!vm.contact || !vm.contact.email) {
                $ionicPopup.alert({ title: 'Error!', template: 'Please, enter recipient information' });
                return;
            }

            requestObj.requestType = 'shareRequest';

            requestObj.text = vm.contact.message || '';
            requestObj.contactInfo = getModifiedContactInfo(vm.contact);
            requestObj.contents = {
                documents: _.pluck(vm.docsToShare, 'id')
            };

            serializedReqObj = utilsService.serialize(requestObj);

            requestService
                .createRequest(serializedReqObj)
                .then(function (response) {
                    showSuccessPopup(response);
                })
                .catch(function (err) {
                    console.error('WARNING: Hard Coded Success', err);
                    showSuccessPopup();
                });

            function getModifiedContactInfo(contact) {
                console.warn(' contact --->>>', contact);
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
