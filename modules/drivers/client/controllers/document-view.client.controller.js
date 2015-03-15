(function () {
    'use strict';

    // Drivers controller
    function DocumentViewController($state, $log, $stateParams, $window, $sce, auth, Drivers, DocAccess, driver) {
        var vm = this;

        if (!auth.user) {
            return $state.go('intro');
        }

        vm.text = {
            title: 'View documents for user'
        };

        // Variables:
        vm.driver = driver;
        vm.auth = auth;
        vm.user = auth.user;

        vm.resume = vm.driver.resume;
        vm.reports = vm.driver.reports || {};

        if(vm.driver && vm.driver.user) {
            vm.profile = vm.driver.user;

            if(vm.profile.displayName) {
                vm.text.title = 'View documents for ' + vm.profile.displayName;
            }
        }

        vm.viewFile = function (fileName) {
            vm.error = null;

            $log.debug('Opening File %o', fileName);

            var file = vm.reports[fileName] || vm.resume;

            DocAccess.updateFileUrl(vm.driver._id, file).then(
                function (success) {
                    vm.documentUrl = success.url;
                    $sce.trustAsResourceUrl(vm.documentUrl);

                    if (!!success.sku) {
                        vm.reports[success.sku] = success;
                    }
                    else {
                        vm.resume = success;
                    }

                    vm.activeReport = fileName;
                },
                function (error) {
                    $log.warn('[DocViewCtrl.updateFileUrl] %s', error);
                    vm.error = error;
                }
            );
        };

        vm.goBack = $state.gotoPrevious;

        if ($stateParams.documentId) {
            vm.viewFile($stateParams.documentId);
        }

    }

    DocumentViewController.$inject = ['$state', '$log', '$stateParams', '$window', '$sce', 'Authentication', 'Drivers', 'DocAccess', 'driver'];


    function PdfViewDirective() {
        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                scope.$watch('src', function (newVal, oldVal) {

                    if (!element.contents().length || !element.contents()[0].contains(newVal)) {
                        var url = newVal;

                        element.contents().remove();

                        if (!!url) {
                            element.append('<object type="application/pdf" height="100%" width="100%" data="' + url + '"></object>');
                        } else {
                            element.append('<h4>No PDF Available</h4>');
                        }
                    }
                });



            },
            scope: {
                src: '@pdfSrc'
            }
        };
    }


    angular.module('drivers')
        .controller('DocumentViewController', DocumentViewController)
        .directive('pdf', PdfViewDirective);
})();
