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

    ///////////////////////////////
    
    ApplicationSummaryController.$inject = ['Authentication', 'Applications', 'Drivers', 'Reports', '$q', '$log', 'toastr'];
    angular.module('applications')
        .controller('ApplicationSummaryController', ApplicationSummaryController);

    function ApplicationSummaryController(auth, Applications, Drivers, Reports, $q, $log, toastr) {
        var vm = this;
        vm.text = text;

        vm.user = auth.user;

        vm.initialize = function (application) {
            var deferred = $q.defer();

            vm.application = application || vm.application;

            if (vm.application) {
                $log.debug('[ApplicationSummaryDirective] Displaying as %s: %o', vm.displayMode, vm.application);

                if (vm.displayMode === 'table') {
                    vm.messagingText = vm.application.isConnected ? 'click here for messaging' : 'available once connected';
                }

                deferred.resolve(vm.application);

            } else if (vm.job && vm.profile) {
                Applications.ById.query({ job: vm.job._id, user: vm.profile._id })
                    .$promise.then(function (success) {
                        $log.debug('Got application(s) for driver: ', success);

                        if (!_.isEmpty(success)) {
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
            } else {
                deferred.reject('no application loaded (yet)');
            }

            deferred.promise.then(function (application) {
                vm.setLocalProperties(application);
            });
        };


        vm.setLocalProperties = function (application) {
            vm.application = application;
            vm.applicant = !!application && application.user || vm.applicant;

            vm.ownerId = vm.job && (vm.job.user._id || vm.job.user);

            if (!_.isEmpty(vm.application)) {
                var messages = vm.application.messages;
                vm.lastMessage = !!messages && !!messages.length ? messages[0] : null;

                vm.showNewBtn = vm.job && vm.job.company !== vm.user.company;
            }

            if (!_.isEmpty(vm.applicant)) {
                vm.experienceText = (
                    !!vm.applicant.experience && vm.applicant.experience.length ?
                        'The applicant\'s experience will be available once connected' :
                        'You can discuss past job experience once you have connected'
                    );
            }
            
            
            // 1. elim 'vm.driver' -> applicant
            // 2. elim 'vm.license'
            // 3. refactor vm.applicant.interests
        };


        vm.initialize();
    }
    
    ///////////////////////////////////////
    
    angular.module('applications')
        .directive('osetApplicationSummary', ApplicationSummaryDirective);

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
                job: '=?',
                profile: '=?',
                index: '=?',
                text: '=?',
                scrollToMessageFn: '&?'
            },
            controller: 'ApplicationSummaryController',
            controllerAs: 'vm',
            bindToController: true,
            require: 'ngModel',

            link: function (scope, element, attrs, ngModel) {
                if (!!ngModel) {
                    scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (newValue) {
                        scope.vm.application = newValue;
                        scope.vm.initialize(newValue);
                    });

                    scope.vm.application = ngModel.$modelValue;
                } else {
                    debugger;
                }
            }
        };

        return ddo;
    }

    //////////////////////////////
        
    
    angular.module('applications')
        .directive('osetApplicationListItem', ApplicationListItemDirective); //<oset-application-list-item ...

    function ApplicationListItemDirective() {
        var ddo;
        ddo = {
            templateUrl: function (elem, attrs) {
                if (!!attrs.job) {
                    return '/modules/applications/views/templates/app-list-item-summary.client.template.html';
                }
                else {
                    return '/modules/applications/views/templates/app-list-item-self.client.template.html';
                }
            },
            restrict: 'E',
            scope: {
                userType: '@', // user-type
                application: '=?',
                job: '=?',
                visibleApp: '=?',
                visibleId: '=?',
                visibleTab: '=?',
                filter: '&'
            },
            controller: ApplicationListItemController,
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }
    ApplicationListItemController.$inject = ['Authentication', 'Applications', '$log', '$state', '$location'];

    function ApplicationListItemController(auth, Applications, $log, $state, $location) {
        var vm = this;

        if (!vm.job && !vm.application) {
            $log.error('[ApplicationListItemCtrl] Neither job nor application is defined... aborting initialization');
            return false;
        }

        vm.getMaskedDisplayName = Applications.getMaskedDisplayName;

        vm.initialize = function () {
            if (!!vm.application) {
                vm.applicant = vm.application.user;
                vm.job = vm.job || vm.application.job;

                if (_.isEmpty(vm.job)) {
                    debugger;
                }

                if (_.isEmpty(vm.job.newMessages)) {
                    vm.job.newMessages = 0;
                }
                vm.checkMessages(vm.application, vm.job);
            }
        };

        vm.visible = function () {
            if (!_.isUndefined(vm.visibleId) && vm.visibleId !== vm.job.id) {
                return false;
            }

            if (!_.isUndefined(vm.visibleTab) && !_.contains(['applicants', 'messaging', 'documents'], vm.visibleTab)) {
                return false;
            }

            if (!_.isUndefined(vm.visibleApp) && vm.visibleApp !== vm.application.id) {
                return false;
            }

            if (_.isFunction(vm.filter) && !vm.filter()(vm.application)) {
                return false;
            }

            return true;
        };

        vm.showTab = function (itemId, tabName) {
            if (!!vm.visibleId && vm.visibleTab === tabName) {
                vm.visibleId = vm.visibleTab = null;
            } else {
                vm.visibleId = itemId;
                vm.visibleTab = tabName;
            }

            $state.transitionTo($state.current, { 'itemId': vm.visibleId, 'tabName': vm.visibleTab });
            $location.search({ 'itemId': vm.visibleId, 'tabName': vm.visibleTab });
        };

        vm.checkMessages = function () {
            Applications.checkMessages(vm.application, auth.user._id)
                .then(function (applicationResponse) {
                    vm.application = applicationResponse;

                    if (vm.application.isActive) {
                        vm.job.newMessages += vm.application.newMessages || 0;
                    }
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

            var app = Applications.setStatus(application.id, status);

            app.then(function (success) {
                $log.debug('[setApplicationStatus] %s', success);
                _.extend(application, success);
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

    ////////////////////////////////////

    angular.module('applications')
        .directive('osetJobListItem', JobItemDirective)

    JobItemDirective.$inject = ['$log'];

    function JobItemDirective($log) {
        var ddo;
        ddo = {
            templateUrl: function (elem, attrs) {
                return '/modules/applications/views/templates/job-list-item.client.template.html';

            },
            restrict: 'E',
            scope: {
                userType: '@', // user-type
                application: '=?',
                job: '=?',
                visibleId: '=',
                visibleTab: '='
            },
            link: link,
            controller: JobListItemController,
            controllerAs: 'vm',
            bindToController: true
        };

        function link(scope, elem, attrs, vm) {

            if (!vm.job) {
                $log.error('[ApplicationJobListItemCtrl] Job is not defined... aborting initialization');
                return false;
            }

            vm.loadApplications();

            vm.job.newMessages = 0;

            vm.filters = {
                status: { 'all': true, 'reviewed': false, 'unreviewed': false, 'connected': false },
                negStatus: { 'rejected': false, 'expired': false }
            };

            vm.sorting = {
                applicants: ['statusIndex', '-created'],
                messaging: ['!messages.length', '-lastMessage.created'], //'-lastMessage.created',
                documents: ['-!!user.driver.resume', '-user.driver.resume.created', '-user.driver.reports.length']
            };

            vm.defaultFiltering = {
                applicants: {},
                messaging: { 'status': { 'connected': true } },
                documents: { 'status': { 'connected': true } }
            };

            vm.reverseSort = false;
        }

        return ddo;
    }


    JobListItemController.$inject = ['Authentication', 'Applications', '$log', '$state', '$location', '$q'];

    function JobListItemController(auth, Applications, $log, $state, $location, $q) {
        var vm = this;

        vm.showTab = showTab;
        vm.toggleFilter = toggleFilter;
        vm.filterApplications = filterApplications;
        vm.getActiveApplicationCount = getActiveApplicationCount;
        vm.setApplicationStatus = setApplicationStatus;
        vm.loadApplications = loadApplications;

        function loadApplications(applications) {
            applications = applications || vm.job.applications;

            if (_.isString(_.first(applications))) {
                vm.loading = true;
                return Applications.getApplicationsForJob(vm.job).then(
                    function success(applicationList) {
                        console.info('JobListItem.loadApplications result: %o for job %o', applicationList, vm.job);
                        vm.applications = applicationList;
                    })
                    .finally(function () {
                        vm.loading = false;
                        vm.applications = vm.applications || [];
                    });
            };

            vm.applications = applications;
        }

        function showTab(itemId, tabName) {
            if (!!vm.visibleId && vm.visibleTab === tabName) {
                vm.visibleId = vm.visibleTab = null;
            } else {
                vm.visibleId = itemId;
                vm.visibleTab = tabName;
            }

            $state.transitionTo($state.current, { 'itemId': vm.visibleId, 'tabName': vm.visibleTab });
            $location.search({ 'itemId': vm.visibleId, 'tabName': vm.visibleTab });
        };

        function toggleFilter(category, key, isRadio) {

            var filterKey = (key || 'all').toLowerCase();

            if (filterKey === 'all') {
                vm.filters[category] = { all: true };
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

        function filterApplications(application) {

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

        function getActiveApplicationCount(applications) {
            return _.where(applications || vm.job.applications, { isActive: true }).length;
        };

        function setApplicationStatus(application, status, $event) {
            $event.stopPropagation();

            var app = vm.ApplicationFactory.setStatus(application._id, status);

            app.then(function (success) {
                $log.debug('[setApplicationStatus] %s', success);
                _.extend(application, success);
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

})();
