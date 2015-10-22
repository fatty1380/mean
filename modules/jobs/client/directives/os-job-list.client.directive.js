(function () {
    'use strict';
    
    angular.module('jobs')
        .directive('osJobList', JobListDirective);

    function JobListDirective() {
        return {
            templateUrl: '/modules/jobs/views/templates/job-list.client.template.html',
            restrict: 'E',
            replace: false,
            scope: {
                header: '@?',
                companyId: '@?',
                srcJobs: '=?',
                showPost: '=?',
                limitTo: '=?',
                config: '=?',
                showSearch: '=?',
                btnClass: '@?'
            },
            controller: JobListDirectiveCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    JobListDirectiveCtrl.$inject = ['Jobs', '$log', '$state', '$location', 'AppConfig', 'Authentication', '$stateParams'];
        
    function JobListDirectiveCtrl(Jobs, $log, $state, $location, config, auth, params) {
        var vm = this;

        vm.visibleId = params.itemId;
        vm.visibleTab = params.tabName;

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

                vm.jobs = Jobs.ById.query({
                    company: vm.companyId
                });
            } else {
                vm.jobs = [];
            }

            if(!!vm.visibleId && !_.find(vm.jobs, {'_id':vm.visibleId})) {
                vm.visibleId = vm.visibleTab = null;
                $state.transitionTo('jobs.list', {'itemId':vm.visibleId, 'tabName':vm.visibleTab});
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
                    delete vm.filter.company;
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

        vm.showAllTypes = true;

        vm.jobCatFilter = function(job) {
            if(vm.showAllTypes) {
                return true;
            }

            // From the Selector: vm.jobCats
            // from the Job: job.cats
            if(!job.cats && !!job.categories) {
                job.cats=_.pluck(_.where(job.categories, 'value'), 'key') || [];
            }

            return !!_.intersection(vm.jobCats, job.cats).length;
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

        vm.showTab = function (jobId, tabName, count) {
            if(tabName === 'applicants' && !!count) {
                // REDIRECT to applicant list for this
                return $state.go('applications.list', {itemId: jobId, tabName: tabName});
            }

            if(!!vm.visibleId && vm.visibleTab === tabName) {
                vm.visibleId = vm.visibleTab = null;
            } else {
                vm.visibleId = jobId;
                vm.visibleTab = tabName;
            }

            $state.transitionTo($state.current, {'itemId':vm.visibleId, 'tabName':vm.visibleTab});
            $location.search({'itemId':vm.visibleId, 'tabName':vm.visibleTab});
        };

        activate();
    }

})();
