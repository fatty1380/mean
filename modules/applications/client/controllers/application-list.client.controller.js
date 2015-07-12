(function () {
    'use strict';

    function ApplicationListController(auth, moduleConfig, applications, Applications, $log, $state, params) {
        var vm = this;

        vm.user = auth.user;
        vm.applications = applications;
        vm.params = params;

        vm.subtitle = !!vm.applications && vm.applications.length ? vm.applications.length + ' Job Applicants' : 'No Active Posts';
        vm.visibleId = params.itemId;
        vm.visibleTab = params.tabName;

        vm.config = moduleConfig || {};
        vm.enableEdt = !!vm.config.edit;

        vm.enableHeaderEdit = vm.user.type === 'owner' && vm.config.enableEdit;

        var co = vm.user.company && vm.user.company.id || null;

        Applications.ById.query({ job: vm.params.jobId, company: co }).$promise
            .then(function (applications) {
                vm.apps = applications;

                vm.newApps = _.where(applications, { 'isUnreviewed': true });

                vm.newMessageCt = _.reduce(applications, function (total, app) {
                    $log.debug('Reducing Messages for app: %o', app);

                    var last = _.findLastIndex(app.messages, { sender: vm.user.id });
                    var newCt = app.messages.length - last + 1;

                    $log.debug('Reduced found %d + 1 - %d = %d', last, app.messages.length, newCt);

                    return total + newCt;
                }, 0);
            });

        // 0 1 2 3 4 5 : 6
        // m m y y m y : 4 5
        // y y y y y y :-1 0

        if ($state.is('applications.all')) {
            setAdminCopy();
        }
        else if (auth.user.type === 'driver') {
            setDriverCopy();

        } else if (auth.user.type === 'owner') {
            setOwnerCopy();

        } else {
            vm.bodyCopy = {};
        }
        
        function setAdminCopy() {
            vm.jobIds = {};

            _.map(vm.applications, function (app) {
                app.jobId = app.job._id;

                if (!_.contains(vm.jobIds, app.jobId)) {
                    vm.jobIds[app.jobId] = app.job;
                }

                vm.jobIds[app.jobId].applications[app._id] = app;
            });

            vm.jobs = _.values(vm.jobIds);

            vm.listTitle = 'Admin Mode Application View';
            vm.subtitle = vm.applications.length + ' Applications across ' + vm.jobs.length + ' Jobs';
        }

        function setDriverCopy() {
            vm.bodyCopy = {
                heading: 'Your job search, all in one place!',
                intro: '<p>Once you have applied to a job on Outset it will appear here for you to track its progress and message the employer.</p>',
                bullets: [
                    'The more information you provide, the better your chances',
                    'Applicants who have reports in their profile are <u>8x more likely</u> to be hired!',
                    'You always have total control over who sees your information'
                ],
                wrap: '<p class="align-center">So put your best foot forward, and apply to jobs now</p>',
                btnSref: 'jobs.list',
                btnText: 'view jobs'
            };

            vm.subtitle = (vm.applications && vm.applications.length || 'No') + ' Active Applications';
        }


        function setOwnerCopy() {
            vm.bodyCopy = {
                heading: 'Your Applicant Tracking System, all in one place!',
                intro: '<p>Once prospective employees have applied to your jobs, this will be the center of your applicant tracking.</p>',
                bullets: [],
                wrap: '<p>So post your jobs, optimize their appearance and details, and come back here once the applications start coming in!</p>',
                btnSref: 'home',
                btnText: 'Return to your Company Dashboard'
            };

            vm.jobs = vm.applications;

            if (!!vm.jobs) {
                var applicationCount = _.reduce(vm.jobs, function (sum, job, other1, other2) {
                    return sum + (!!job.applications ? job.applications.length : 0);
                }, 0);

                if (vm.jobs.length > 0) {
                    vm.subtitle = vm.jobs.length + ' Active Job' + (vm.jobs.length > 1 ? 's' : '');
                }

                if (applicationCount > 0) {
                    vm.subtitle = vm.subtitle + ' <small>' + applicationCount + ' Applications</small>';
                } else {
                    vm.subtitle = vm.subtitle + ' <small>no applications</small>';
                }
            }
        }
    }

    ApplicationListController.$inject = ['Authentication', 'config', 'applications', 'Applications', '$log', '$state', '$stateParams'];

    angular.module('applications')
        .controller('ApplicationListController', ApplicationListController);

})();
