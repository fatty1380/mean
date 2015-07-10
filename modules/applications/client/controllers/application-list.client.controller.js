(function () {
    'use strict';

    function ApplicationListController(auth, moduleConfig, applications, $state) {
        var vm = this;

        vm.applications = applications;
        vm.config = moduleConfig || {};

        vm.subtitle = !!vm.applications && vm.applications.length ? vm.applications.length + ' Job Applicants' : 'No Active Posts';

        vm.enableEdt = !!vm.config.edit;
        vm.user = auth.user;

        vm.enableHeaderEdit = vm.user.type === 'owner' && vm.config.enableEdit;


        if($state.is('applications.all')) {
            vm.jobIds = {};

            _.map(vm.applications, function(app) {
                app.jobId = app.job._id;

                if(!_.contains(vm.jobIds,  app.jobId)) {
                    vm.jobIds[app.jobId] = app.job;
                }

                vm.jobIds[app.jobId].applications[app._id] = app;
            });

            vm.jobs = _.values(vm.jobIds);

            vm.listTitle = 'Admin Mode Application View';
            vm.subtitle = vm.applications.length + ' Applications across ' + vm.jobs.length + ' Jobs';
        }
        else if (auth.user.type === 'driver') {
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

        } else if (auth.user.type === 'owner') {
            vm.bodyCopy = {
                heading: 'Your Applicant Tracking System, all in one place!',
                intro: '<p>Once prospective employees have applied to your jobs, this will be the center of your applicant tracking.</p>',
                bullets: [],
                wrap: '<p>So post your jobs, optimize their appearance and details, and come back here once the applications start coming in!</p>',
                btnSref: 'home',
                btnText: 'Return to your Company Dashboard'
            };

            vm.jobs = vm.applications;

            if(!!vm.jobs) {
                var applicationCount = _.reduce(vm.jobs, function(sum, job, other1, other2) {
                    return sum + (!!job.applications ? job.applications.length : 0);
                }, 0);

                if (vm.jobs.length > 0) {
                    vm.subtitle = vm.jobs.length + ' Active Job' + (vm.jobs.length > 1 ? 's' : '');
                }

                if(applicationCount > 0) {
                    vm.subtitle = vm.subtitle + ' <small>' + applicationCount + ' Applications</small>';
                } else {
                    vm.subtitle = vm.subtitle + ' <small>no applications</small>';
                }
            }

        } else {
            vm.bodyCopy = {};
        }
    }


    ApplicationListController.$inject = ['Authentication', 'config', 'applications', '$state'];

    angular.module('applications')
        .controller('ApplicationListController', ApplicationListController);

})();
