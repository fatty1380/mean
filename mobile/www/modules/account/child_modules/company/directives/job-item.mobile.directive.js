/* global logger */
/* global _ */
(function () {
    'use strict';

    angular.module('company')
        .directive('tlineJobItem', jobItemDirective);

    jobItemDirective.$inject = [];

    function jobItemDirective () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'modules/account/child_modules/company/templates/job-item.mobile.template.html',
            controller: JobItemCtrl,
            controllerAs: 'vm',
            bindToController: {
                entry: '=model',
                embedded: '@?'
            },
            scope: {
                entry: '=model',
                embedded: '@?'
            },
            link: link
        };

        function link (scope, el, attr, vm) {
            vm.job = scope.entry;

            if (_.isEmpty(vm.job)) {
                return;
            }

            vm.embedded = (attr.embedded === 'true');

            vm.location = _.first(vm.job.location);

            if (!!vm.location) {
                vm.locationString = [vm.location.city, vm.location.state, vm.location.zip].join(', ');
            }

            if (!!vm.job.location) {
                vm.markers = {
                    color: 'red',
                    label: '',
                    coords: vm.location.coordinates || []
                };
            }

            vm.activate();

        }
    }

    JobItemCtrl.$inject = ['activityService', 'companyModalService', '$state', '$ionicPopup', '$sce', 'LoadingService', 'CompanyService'];
    function JobItemCtrl (activityService, companyModalService, $state, $ionicPopup, $sce, LoadingService, Companies) {
        var vm = this;

        vm.stringify = function (obj) {
            return JSON.stringify(obj, null, 2);
        };

        vm.activate = activate;
        vm.apply = apply;
        vm.trust = trustMe;

        // ////////////////////////////////////////////////////////////////

        function activate () {
            if (_.isEmpty(vm.job)) {
                logger.error('Whoa man, no entry, no directive! What are you thinking');
                return;
            }

            if (_.isString(vm.job.company)) {
                Companies.get(vm.job.company)
                    .then(function (company) {
                        vm.company = company;
                        vm.avatar = vm.company.images && vm.company.images.square;
                    });
            } else {
                vm.avatar = vm.job.company.profileImageURL;
            }

            vm.itemClick = !!vm.embedded ? showDetailsModal : _.noop;

            // vm.username = vm.job.company.name;
            vm.title = vm.job.name;

            vm.location = _.first(vm.job.location);

            if (!!vm.location) {
                vm.placeName = vm.location.city + ', ' + vm.location.state;
                vm.locationString = [vm.location.city, vm.location.state, vm.location.zip].join(', ');
            }
        }

        function showDetailsModal () {
            if (!!vm.job.company && vm.job.company.id) {
                return $state.go('company', { companyId: vm.job.company.id });
            }

            companyModalService
                .showJobDetailsModal({ entry: vm.job })
                .then(function (res) {
                    logger.debug('Details Complete', res);
                }, function (err) {
                    activityService.showPopup('10-7', 'Please try later');
                });
        }



        function apply (entry) {
            var applyPopup = $ionicPopup.confirm({
                title: 'Send Application',
                template: 'This will send your profile to ' + (entry.company.name || 'the employer') + ' for review. Continue?'
            });
            applyPopup.then(function (res) {
                if (res) {
                    LoadingService.showSuccess('Thanks for Applying');
                } else {
                    logger.debug('You are not sure');
                }
            });
        }


        function trustMe (html) {
            return $sce.trustAsHtml(html.replace(/\<br\>/gi, ' '));
        }
    }
})();
