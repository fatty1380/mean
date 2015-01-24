(function () {
    'use strict';

    // Jobs controller
    function JobsListController($state, Authentication, jobs, company, moduleConfig) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;
        vm.config = moduleConfig || {};

        vm.enableEdit = !!vm.config.edit;

        vm.jobs = jobs;
        vm.company = company;

        vm.subtitle = vm.jobs.length + ' Open Jobs.';


        if (vm.auth.user.type === 'driver') {
            vm.bodyCopy = {
                heading: 'Jobs are <em>Coming Soon!</em>',
                intro: '<p>Before opening up the site to employers, we are giving you time to build your profile and get your reportsready.</p>',
                bullets: [
                    'The more information you provide, the better your chances',
                    'Applicants who have reports in their profile are <u>8x more likely</u> to be hired!',
                    'You always have total control over who sees your information'
                ],
                wrap: '<p>So put your best foot forward, and we’ll let you know when its time to apply!</p>',
                homeTxt: 'Back to your Profile Page'
            };

        } else if (vm.auth.user.type === 'owner') {
            vm.bodyCopy = {
                heading: 'Your Applicant Tracking System, all in one place!',
                intro: '<p>Once prospective employees have applied to your jobs, this will be the center of your applicant tracking.</p>',
                bullets: [],
                wrap: '<p>So post your jobs, optimize their appearance and details, and come back here once the applications start coming in!</p>',
                homeTxt: 'Return to your Company Dashboard'
            };
        } else {
            vm.bodyCopy = {};
        }




        function activate() {
            if ($state.is('jobs.list')) {
                vm.listTitle = 'Outset Job Listings';
            } else if ($state.is('jobs.mine')) {
                vm.listTitle = (vm.user.type === 'driver') ? 'My Jobs' : 'My Job Postings';
            }

            // TODO: Split out into Edit/Create/List permissions
            if (vm.user.type === 'driver') {
                vm.enableEdit = false;
            }
            else if (vm.user.type === 'owner') {
                vm.enableEdit = vm.user._id === (vm.company && (vm.company.owner._id || vm.company.owner));
            }
            else if (vm.user.isAdmin) {
                vm.enableEdit = true;
            }
        }

        activate();
    }

    JobsListController.$inject = ['$state', 'Authentication','jobs', 'company', 'config'];

    angular.module('jobs')
        .controller('JobsListController', JobsListController);

})();
