(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['contacts', '$state', '$q', '$cordovaGoogleAnalytics', '$ionicPopup', '$http',
        'settings', 'utilsService', 'LoadingService', 'contactsService', '$filter'];

    function AddContactFriendsCtrl(contacts, $state, $q, $cordovaGoogleAnalytics, $ionicPopup, $http,
        settings, utilsService, LoadingService, contactsService, $filter) {
        var vm = this;

        vm.contacts = contacts || contactsService.getContacts();
        vm.contactsResolved = contactsService.isResolved();

        vm.skip = skip;
        vm.back = goBack;
        vm.loadContacts = loadContacts;
        vm.sendInvitations = sendInvitations;
        
        ///////////////////////////////////////////////////////////////////

        function skip() {
            $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'skip');
            $state.go('account.profile');
        }

        function goBack() {
            $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'gotBack');
            return $state.go('signup.friends');
        }

        function loadContacts() {
            LoadingService.showLoader('Loading Contacts');
            var then = Date.now();
            return contactsService.resolveContacts()
                .then(function handleResolvedContacts(resolvedContacts) {
                    vm.contacts = resolvedContacts; // contactsService.getContacts();
                    vm.contactsResolved = contactsService.isResolved();

                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'addContacts', 'loadContacts');
                })
                .finally(LoadingService.hide);
        }

        function sendInvitations() {
            var filter = $filter('getChecked');
            var selectedContacts = filter(vm.contacts, { clearChecked: false });

            if (!selectedContacts.length) {
                LoadingService.showFailure('Please select at least one contact to invite');
                $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites.none');
                return;
            }

            var then = Date.now();

            $ionicPopup.confirm({
                title: 'TruckerLine Invites',
                template: 'Invite ' + selectedContacts.length + ' selected contacts?'
            })
                .then(function (res) {
                    if (res) {
                        LoadingService.showLoader('Sending Invitations');
                        // TODO: COMBINE w/ profile.add.friends.controller
                        //return friendsService.sendRequests(selectedContacts);

                        ///////
                        var reqs = [];
                        for (var i = 0; i < selectedContacts.length; i++) {
                            logger.warn('selectedContacts --->>>', selectedContacts);
                            var hasHashKey = selectedContacts[i].$$hashKey;
                            if (hasHashKey) {
                                delete selectedContacts[i].$$hashKey;
                            }

                            var postData = { contactInfo: selectedContacts[i], text: '' };

                            var r = $http
                                .post(settings.requests, postData)
                                .then(function (resp) {
                                    logger.info('Send Request Success resp --->>>', resp);

                                }, function (err) {
                                    logger.error('Send request err --->>>', err);
                                });

                            reqs.push(r);
                        }

                        return $q.all(reqs);

                    } else {
                        logger.debug('friends are not invited');
                        return $q.reject('cancel');
                    }
                })
                .then(function (sentRequests) {

                    logger.debug('Sent ' + sentRequests.length + ' requests');
                    LoadingService.showSuccess('Invitations Sent');

                    $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites', sentRequests.length);
                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'addContacts', 'sendInvites');

                    $state.go('account.profile');
                })
                .catch(function (err) {

                    if (/cancel/i.test(err)) {

                        $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites.cancel');
                        logger.debug('user cancelled');
                        return;
                    }

                    logger.error('Unable to invite friends:', err);

                    $ionicPopup
                        .confirm({
                            title: 'Sorry',
                            template: 'Failed to send invites. Try again?'
                        })
                        .then(function (res) {

                            if (res) {
                                $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites.retry');
                                return sendInvitations();
                            }

                            $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites.giveUp');
                            $state.go('account.profile');
                        });

                });
        }
    }
})();
