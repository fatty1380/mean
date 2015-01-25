(function () {
    'use strict';

    function ApplicationListController(auth, moduleConfig, applications) {
        var vm = this;

        vm.applications = applications;
        vm.config = moduleConfig || {};

        vm.subtitle = !!vm.applications && vm.applications.length ? vm.applications.length + ' Job Applicants' : 'No Active Posts';

        vm.enableEdt = !!vm.config.edit;


        if (auth.user.type === 'driver') {
            vm.bodyCopy = {
                heading: 'Your job search, all in one place!, <em>Coming Soon!</em>',
                intro: '<p>Once we have opened the site to employers, your entire job search will be available here.</p><p>Until then, take the time to build your profile and get your reports ready.</p>',
                bullets: [
                    'The more information you provide, the better your chances',
                    'Applicants who have reports in their profile are <u>8x more likely</u> to be hired!',
                    'You always have total control over who sees your information'
                ],
                wrap: '<p>So put your best foot forward, and we’ll let you know when its time to apply!</p>',
                homeTxt: 'Back to your Profile Page'
            };

            vm.subtitle = (vm.applications && vm.applications.length || 'No') + ' Active Applications';

        } else if (auth.user.type === 'owner') {
            vm.bodyCopy = {
                heading: 'Your Applicant Tracking System, all in one place!',
                intro: '<p>Once prospective employees have applied to your jobs, this will be the center of your applicant tracking.</p>',
                bullets: [],
                wrap: '<p>So post your jobs, optimize their appearance and details, and come back here once the applications start coming in!</p>',
                homeTxt: 'Return to your Company Dashboard'
            };

            vm.jobs = vm.applications;

            if(!!vm.jobs) {
                var applicationCount = _.reduce(vm.jobs, function(sum, job) {
                    return sum + job.applications.length;
                });

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


    ApplicationListController.$inject = ['Authentication', 'config', 'applications'];

    angular.module('applications')
        .controller('ApplicationListController', ApplicationListController);

})();
