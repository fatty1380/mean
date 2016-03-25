(function () {
    'use strict';

	/**
	 * @desc document Add directive that can be used anywhere across apps to get/gather contact information from the user.
	 * @example <tline-manual-contact model="vm.contact" />
	 */
    angular.module(AppConfig.appModuleName)
        .directive('tlineDocView', ViewDocumentDirective)
        .directive('tlineDocAttrView', ViewDocAttrDirective);

    function ViewDocAttrDirective () {
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                document: '=model',
                newDocFn: '&',
                btnText: '@?'
            },
            controller: ViewDocDirectiveCtrl,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        // Inject controller as 'vm' for consistency
        function link (scope, el, attr, vm) {
            // Set defaults
            vm.scope = scope;

            el.bind('click', function (event) {
                logger.debug('Displaying doc at URL: ', vm.document.url);
                vm.docClick(event);
            });
        }
    }

    function ViewDocumentDirective () {
        var directive = {
            link: link,
            template: documentTemplate,
            restrict: 'E',
            scope: {
                document: '=model',
                newDocFn: '&',
                btnText: '@?'
            },
            controller: ViewDocDirectiveCtrl,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        // Inject controller as 'vm' for consistency
        function link (scope, el, attr, vm) {
            // Set defaults
            vm.scope = scope;

            if (!vm.document) {
                vm.btnText = 'n/a';
                el.ngShow = false;
            }
        }
    }

    ViewDocDirectiveCtrl.$inject = ['modalService', 'lockboxModalsService', 'lockboxSecurity', 'LoadingService', '$timeout'];
    function ViewDocDirectiveCtrl(DocPreview, LockboxModals, lockboxSecurity, Loader, $timeout) {
        var vm = this;

        vm.docClick = function(event) {

            event.stopPropagation();

            if (vm.document.url) {
                return lockboxSecurity
                    .checkAccess({ setNew: true, throwOnFail: true })

                    .then(function () {
                        if (vm.document.sku !== 'res') {
                            return true;
                        }

                        return LockboxModals.showResumeValidationModal({ validationMode: 'view', document: vm.document })
                            .catch(function resumeRefreshFailed (err) {
                                logger.error('Resume Refresh failed', err);

                                Loader.showFailure(err.userMessage || 'Sorry, Unable to update resume at&nbsp;this&nbsp;time');

                                $timeout(function () {
                                    Loader.showFailure('Showing latest copy');
                                    vm.closeModal(vm.document);
                                }, 1000);
                            })
                    })
                    .then(function() {
                        debugger;
                        return showDocument(vm.document, event);
                    })
                    .catch(function (err) {
                        logger.error('Lockbox Access Failed', err);
                    });
            }

            return vm.newDocFn()(vm.document.sku);
        };

        activate();

        // /

        function activate () {
            vm.btnText = vm.document && vm.document.name || 'huh?';

            if (!!vm.document && !!vm.document.created) {
                vm.created = moment(vm.document.created, moment.ISO_8601).format('L');
            }
            //            vm.btnText = vm.btnText || 'View';
        }

        function showDocument (document, event) {
            if (!!event) {
                event.stopPropagation();
            }
            document = document || vm.document;
            return DocPreview.show('modules/account/child_modules/lockbox/templates/modal-preview.html',
                'DocumentModalCtrl as vm',
                document);
        }
    }

    var documentTemplate =
        '<div class="{{!!vm.document.url ? \'button-document\' : \'button-stub\' }}" ng-click="vm.docClick($event)">' +
        '<div class="" ng-class="{\'no-date\': !vm.created}">' +
        '    <div class="doc-name">{{ vm.document.name }}</div>' +
        '    <!-- <div class="doc-date">{{ vm.created }}</div> -->' +
        '    <i class="icon {{vm.document.icon}}"></i>' +
        '</div>' +
        '</div>';

})();
