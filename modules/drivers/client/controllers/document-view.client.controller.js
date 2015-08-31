(function () {
    'use strict';


    // Drivers controller
    DocumentViewController.$inject = ['$state', '$log', '$stateParams', '$window', '$sce', 'Authentication', 'Drivers', 'DocAccess', 'driver'];
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

        vm.reports = vm.driver.reports || {};

        if (vm.driver && vm.driver.user) {
            vm.profile = vm.driver.user;

            if (vm.profile.displayName) {
                vm.text.title = 'View documents for ' + vm.profile.displayName;

                vm.fileUser = vm.profile.displayName.replace(' ', '');
            }
        }

        vm.viewFile = function (fileName) {
            vm.error = null;

            $log.debug('Opening File %o', fileName);

            var file = vm.reports[fileName];

            DocAccess.updateFileUrl(vm.driver._id, file)
                .then(function (success) {
                    vm.documentUrl = success.url;
                    vm.documentTitle = vm.fileUser + '_' + fileName + '.pdf';

                    $sce.trustAsResourceUrl(vm.documentUrl);

                    vm.reports[success.sku] = success;

                    vm.activeReport = fileName;
                })
                .catch(function (error) {
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

    

    function PdfViewDirective() {
        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                scope.$watch('src', function (newVal, oldVal) {

                    if (!element.contents().length || !element.contents()[0].contains(newVal)) {
                        var url = newVal;

                        element.contents().remove();

                        if (!!url) {
                            var tag = '<object data="reportURL" type="application/pdf" width="100%" height="100%"> ' +
                                '<p class="text-center">It appears your Web browser is not configured to display PDF files. No worries, just <a href="reportURL">click here to download the PDF file.</a></p>' +
                                '</object>';
                            element.append(tag.replace(/reportURL/g, url));
                        } else {
                            element.append('<h4 class="text-center">Sorry ... document not available</h4>');
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
