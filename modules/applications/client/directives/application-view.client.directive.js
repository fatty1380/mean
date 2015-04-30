(function () {
    'use strict';

    var text = {
        pre: {
            about: 'the applicant\'s full <strong>about me</strong> section will be available once you are connected',
            messaging: {
                owner: 'once you have connected, you will be able to converse with the Applicant to ask and answer questions, coordinate a telephone or in-person interview, or anything else to help you find the right employee.',
                driver: 'once you have connected, you will be able to converse with the Employer to ask and answer questions, coordinate a telephone or in-person interview, or anything else to help you find the right job.'
            }
        }
    };

    function ViewApplicantDirective() {
        var ddo;
        ddo = {
            templateUrl: '/modules/applications/views/templates/applicant-details.client.template.html',
            restrict: 'E',
            scope: {
                application: '=',
                scrollToMessageFn: '&?'
            },
            controller: 'ViewApplicantController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function ApplicationSummaryController(auth, Applications, Drivers, Reports, $q, $log, toastr) {
        var vm = this;
        vm.text = text;

        vm.user = auth.user;

        function initialize() {
            var deferred = $q.defer();

            if (vm.application) {
                $log.debug('[ApplicationSummaryDirective] Displaying as %s: %o', vm.displayMode, vm.application);

                if (vm.displayMode === 'table') {
                    vm.messagingText = vm.application.isConnected ? 'click here for messaging' : 'available once connected';
                }

                deferred.resolve(vm.application);

            } else if (vm.job && vm.profile) {
                Applications.ById.query({job: vm.job._id, user: vm.profile._id})
                    .$promise.then(function (success) {
                        $log.debug('Got application(s) for driver: ', success);

                        if(!_.isEmpty(success)) {
                            deferred.resolve(_.first(success));
                        }
                        else {
                            deferred.resolve(null);
                        }

                    }, function (failure) {
                        if (failure.status === 404) {
                            return null;
                        } else {
                            $log.error('Unable to lookup application based on job and user: %o', failure);
                            debugger;
                        }
                    });
            }

            deferred.promise.then(vm.setLocalProperties);
        }

        vm.setLocalProperties = function (application) {

            vm.application = application;

            vm.ownerId = vm.job && (vm.job.user._id || vm.job.user);

            if(!_.isEmpty(vm.application)) {
                var messages = vm.application.messages;
                vm.lastMessage = !!messages && !!messages.length ? messages[0] : null;

                vm.showNewBtn = vm.job.company !== vm.user.company;
            }

            vm.profile = !!application && application.user || vm.profile;
            vm.driver = vm.profile.driver || Drivers.getByUser(vm.profile._id);
            vm.license = !!vm.driver.licenses && vm.driver.licenses.length ? vm.driver.licenses[0] : null;

            vm.experienceText = (
                !!vm.driver && !!vm.driver.experience && vm.driver.experience.length ?
                    'The applicant\'s experience will be available once connected' :
                    'You can discuss past job experience once you have connected'
            );

            if (!vm.driver) {
                debugger;
                Drivers.getByUser(vm.applicant._id).then(
                    function (success) {
                        vm.profile.driver = vm.driver = success;
                    }
                );
            }
        };

        initialize();
    }

    function ApplicationSummaryDirective() {
        var ddo;
        ddo = {
            templateUrl: function (elem, attrs) {
                switch (attrs.displayMode || 'normal') {
                    case 'details':
                        return '/modules/applications/views/templates/applicant-details.client.template.html';
                    case 'minimal':
                    case 'mine':
                    case 'table':
                        return '/modules/applications/views/templates/application-summary.client.template.html';
                    case 'inline':
                        return '/modules/applications/views/templates/applicant-normal.client.template.html';
                }
            },
            restrict: 'E',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal', 'mine'
                application: '=?model',
                job: '=?',
                profile: '=?',
                index: '=?',
                text: '=?',
                scrollToMessageFn: '&?'
            },
            controller: 'ApplicationSummaryController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function ApplicationListItemController(auth, Applications, $log, $state, $location) {
        var vm = this;

        if (!vm.job && !vm.application) {
            $log.error('[ApplicationListItemCtrl] Neither job nor application is defined... aborting initialization');
            return false;
        }

        vm.Applications = Applications;

        vm.initialize = function () {
            if (!!vm.application) {
                vm.profile = vm.application.user;
                vm.job = vm.job || vm.application.job;

                if(_.isEmpty(vm.job.newMessages)) {
                    vm.job.newMessages = 0;
                }
                vm.checkMessages(vm.application, vm.job);
            }
        };

        vm.showTab = function (itemId, tabName) {
            if (!!vm.visibleId && vm.visibleTab === tabName) {
                vm.visibleId = vm.visibleTab = null;
            } else {
                vm.visibleId = itemId;
                vm.visibleTab = tabName;
            }

            $state.transitionTo($state.current, {'itemId': vm.visibleId, 'tabName': vm.visibleTab});
            $location.search({'itemId': vm.visibleId, 'tabName': vm.visibleTab});
        };

        vm.checkMessages = function () {
            Applications.checkMessages(vm.application, auth.user._id)
                .then(function (applicationResponse) {
                    vm.application = applicationResponse;
                    vm.job.newMessages += vm.application.newMessages || 0;
                })
                .catch(function (err) {
                    if (!!vm.application.connection) {
                        $log.error('Failed to load messages for job %s due to error: %o', vm.job._id, err);
                    }
                    else {
                        $log.debug('No connection, no messages. Simple!', err);
                    }
                });
        };

        vm.setApplicationStatus = function (application, status, $event) {
            $event.stopPropagation();

            var app = vm.ApplicationFactory.setStatus(application._id, status);

            app.then(function (success) {
                $log.debug('[setApplicationStatus] %s', success);
                application = success;
            }, function (reject) {
                debugger;
                $log.warn('[setApplicationStatus] %s', reject);
            });

            application.status = status;
            application.isNew = application.isConnected = false;
            application.isRejected = true;
            application.disabled = true;
        };

        vm.initialize();
    }

    function ApplicationListItemDirective() {
        var ddo;
        ddo = {
            templateUrl: function (elem, attrs) {
                switch (attrs.userType) {
                    case 'driver':
                        return '/modules/applications/views/templates/driver-list-item.client.template.html';
                    case 'owner':
                        return '/modules/applications/views/templates/owner-list-item.client.template.html';
                }
            },
            restrict: 'E',
            scope: {
                userType: '@', // user-type
                application: '=?',
                job: '=?',
                visibleId: '=',
                visibleTab: '='
            },
            controller: 'ApplicationListItemController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }


    function ApplicationJobListItemController(auth, Applications, $log, $state, $location) {
        var vm = this;

        if (!vm.job) {
            $log.error('[ApplicationJobListItemCtrl] Job is not defined... aborting initialization');
            return false;
        }

            vm.job.newMessages = 0;

        vm.showTab = function (itemId, tabName) {
            if (!!vm.visibleId && vm.visibleTab === tabName) {
                vm.visibleId = vm.visibleTab = null;
            } else {
                vm.visibleId = itemId;
                vm.visibleTab = tabName;
            }

            $state.transitionTo($state.current, {'itemId': vm.visibleId, 'tabName': vm.visibleTab});
            $location.search({'itemId': vm.visibleId, 'tabName': vm.visibleTab});
        };

        vm.filters = {
            status: {'all': true, 'reviewed': false, 'unreviewed': false, 'connected': false},
            negStatus: {'rejected': false, 'expired': false}
        };

        vm.sorting = {
            applicants: ['statusIndex', '-created'],
            messaging: ['!messages.length', '-lastMessage.created'], //'-lastMessage.created',
            documents: ['-!!user.driver.resume', '-user.driver.resume.created', '-user.driver.reports.length']
        };

        vm.defaultFiltering = {
            applicants: {},
            messaging: {'status': {'connected': true}},
            documents: {'status': {'connected': true}}
        };

        vm.reverseSort = false;

        vm.toggleFilter = function (category, key, isRadio) {

            var filterKey = (key || 'all').toLowerCase();

            if (filterKey === 'all') {
                vm.filters[category] = {all: true};
                return;
            }

            if (!vm.filters[category]) {
                vm.filters[category][filterKey] = true;
            }

            //vm.filters[category][filterKey] = !vm.filters[category][filterKey];

            if (isRadio) {
                _.map(_.keys(vm.filters[category]), function (mapKey) {
                    if (mapKey !== filterKey) {
                        vm.filters[category][mapKey] = false;
                    }
                });
            }

            if (!!vm.filters[category].all) {
                vm.filters[category].all = false;
            } else if (isRadio) {
                // The setting has not been updated, so setting all to the old
                // value will handle the de-selection of the only selected item
                vm.filters[category].all = vm.filters[category][filterKey];
            }
        };

        vm.filterApplications = function (application) {

            var keys = _.keys(vm.filters);
            for (var i = 0; i < keys.length; i++) {
                var status, tmp = vm.filters[keys[i]];

                switch (keys[i]) {
                    case 'negStatus':
                    case 'status':
                        if (!tmp || tmp['all']) {
                            break;
                        }
                        if (!!tmp) {
                            status = (application.statusCat || application.status).toLowerCase();
                            if (_.isBoolean(tmp[status]) && !tmp[status]) {
                                $log.debug('Ignoring application with status `%s`', status);
                                return false;
                            }
                        }
                        break;

                }
            }

            return true;
        };

        vm.setApplicationStatus = function (application, status, $event) {
            $event.stopPropagation();

            var app = vm.ApplicationFactory.setStatus(application._id, status);

            app.then(function (success) {
                $log.debug('[setApplicationStatus] %s', success);
                application = success;
            }, function (reject) {
                debugger;
                $log.warn('[setApplicationStatus] %s', reject);
            });

            application.status = status;
            application.isNew = application.isConnected = false;
            application.isRejected = true;
            application.disabled = true;
        };
    }

    function ApplicationJobListItemDirective() {
        var ddo;
        ddo = {
            templateUrl: function (elem, attrs) {
                        return '/modules/applications/views/templates/owner-job-list-item.client.template.html';

            },
            restrict: 'E',
            scope: {
                userType: '@', // user-type
                application: '=?',
                job: '=?',
                visibleId: '=',
                visibleTab: '='
            },
            controller: 'ApplicationJobListItemController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    ApplicationSummaryController.$inject = ['Authentication', 'Applications', 'Drivers', 'Reports', '$q', '$log', 'toastr'];
    ApplicationListItemController.$inject = ['Authentication', 'Applications', '$log', '$state', '$location'];
    ApplicationJobListItemController.$inject = ['Authentication', 'Applications', '$log', '$state', '$location'];

    angular.module('applications')
        .controller('ApplicationSummaryController', ApplicationSummaryController)
        .controller('ApplicationListItemController', ApplicationListItemController)
        .controller('ApplicationJobListItemController', ApplicationJobListItemController)
        .directive('osetApplicationSummary', ApplicationSummaryDirective)
        .directive('osetApplicationJobListItem', ApplicationJobListItemDirective)
        .directive('osetApplicationListItem', ApplicationListItemDirective); //<oset-application-list-item ...

})();
