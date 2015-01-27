(function () {
    'use strict';

    function JobListController(Jobs, $log, $state, config, auth, params) {
        var vm = this;

        vm.visibleJob = params.jobId;
        vm.visibleTab = params.tabname;

        vm.config = vm.config || config.getModuleConfig(auth.user.type, 'jobs')
            .then(function (success) {
                vm.config = success;
            });

        config.getAsync('debug').then(function (success) {
            vm.debug = !!success;
        });

        vm.showSearch = vm.showSearch === undefined ? true : !!vm.showSearch;
        vm.limitTo = vm.limitTo || 100;
        vm.filter = {};

        vm.user = auth.user;
        vm.myJobsOnly = false;

        function activate() {

            if (!vm.companyId && !vm.driverId && !vm.srcJobs) {
                $log.warn('[%s] should Specify a company or driver, or set srcJobs pre-load', 'JobListController');

                if ($state.includes('jobs')) {
                    $log.error('[%s] Routing back to user\'s home page', 'JobListController');
                    $state.go('home');
                }
            }

            if (!!vm.companyId && !!vm.driverId) {
                $log.warn('[%s] Both company and driver specified, defaulting to company', 'JobListController');
            }

            if (!!vm.srcJobs && vm.srcJobs.length >= 0) {
                vm.jobs = vm.srcJobs;
            }
            else if (!!vm.companyId) {
                vm.filter.company = {'_id': vm.companyId};
                vm.myJobsOnly = true;

                vm.jobs = Jobs.ByCompany.query({
                    companyId: vm.companyId
                });
            } else if (!!vm.driverId) {
                vm.jobs = Jobs.ByUser.query({
                    userId: vm.driverId
                });
            } else {
                vm.jobs = [];
            }

            if(!!vm.visibleJob && !_.find(vm.jobs, {'_id':vm.visibleJob})) {
                vm.visibleJob = vm.visibleTab = null;
                $state.transitionTo('jobs.list', {'jobId':vm.visibleJob, 'tabname':vm.visibleTab});
            }
        }

        vm.showMore = function () {
            vm.limitTo += 100;
        };

        vm.toggleFilterMine = function () {
            // Toggling into the filtered state
            if (!vm.filters.mine) {
                vm.filter.company = {'_id': vm.companyId};
            }
            else {
                if (vm.filter.hasOwnProperty('company')) {
                    delete vm.filter['company'];
                }
            }
            vm.filters.clear = !(vm.filters.today || vm.filters.week || vm.filters.unseen || !vm.filters.mine);
        };

        var filterProto = {
            numDays: 0,
            day: false,
            week: false,
            unseen: false,
            mine: false,
            clear: true
        };

        vm.filters = _.clone(filterProto);

        vm.toggleFilter = function(filter) {
            var predicate = '';
            switch(filter) {
                case 'today':
                    if(vm.filters.numDays === 1) {
                        vm.filters.numDays = 0;
                    } else {
                        vm.filters.week = false;
                        vm.filters.numDays = 1;
                        vm.filters.clear = false;
                    }
                    break;
                case 'week':
                    if(vm.filters.numDays === 7) {
                        vm.filters.numDays = 0;
                    } else {
                        vm.filters.day = false;
                        vm.filters.numDays = 7;
                        vm.filters.clear = false;
                    }
                    break;
                case 'unseen':
                    break;
                case 'clear':
                    vm.filters = _.clone(filterProto);
                    return;
            }
        };

        function filterToggle(name, predicate) {

            var val = vm.filters[name];

            if(!!val) {
                vm.filter[name] = predicate;
            } else {
                if (vm.filter.hasOwnProperty(name)) {
                    delete vm.filter[name];
                }
            }
        }

        vm.predicate = 'posted';
        vm.reverse = true;

        vm.toggleSort = function(field, reverse) {

            if(field === vm.predicate) {
                vm.reverse = !vm.reverse;
            } else {
                vm.predicate = field;
                vm.reverse = !!reverse;
            }
        };

        vm.searchTermFilter = function (job) {
            if (!vm.searchTerms) {
                return true;
            }

            var terms = vm.searchTerms.split(' ');
            var reg = new RegExp('(?=' + terms.join(')(?=') + ')','i');

            job.searchText = job.searchText || [job.name, job.description, job.requirements].join(' ');

            return reg.test(job.searchText);
        };

        vm.showTab = function (jobId, tabname) {
            vm.visibleJob = jobId;
            vm.visibleTab = tabname;

            $state.transitionTo('jobs.list', {'jobId':vm.visibleJob, 'tabname':vm.visibleTab});
        };

        activate();
    }

    function JobListDirective() {
        return {
            templateUrl: 'modules/jobs/views/templates/job-list.client.template.html',
            restrict: 'E',
            replace: false,
            scope: {
                header: '@?',
                companyId: '@?',
                driverId: '@?',
                srcJobs: '=?',
                showPost: '=?',
                limitTo: '=?',
                config: '=?',
                showSearch: '=?'
            },
            controller: 'JobListController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    JobListController.$inject = ['Jobs', '$log', '$state', 'AppConfig', 'Authentication', '$stateParams'];

    angular.module('jobs')
        .controller('JobListController', JobListController)
        .directive('osJobList', JobListDirective);

    angular.module('core').filter('withinPastDays', function(){
        return function(items, field, days){
            if(!days) { return items.filter(function(){return true;}); }

            var timeStart = moment().subtract(days, 'days');
            console.log('filtering back %s days to %s', days, timeStart.format('L'));
            return items.filter(function(item){
                return (moment(item[field]).isAfter(timeStart));
            });
        };
    });

})();
