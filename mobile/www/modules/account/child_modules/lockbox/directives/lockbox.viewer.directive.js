(function () {
    'use strict';

	/**
	 * @desc document Add directive that can be used anywhere across apps to get/gather contact information from the user.
	 * @example <oset-manual-contact model="vm.contact" />
	 */
    angular.module(AppConfig.appModuleName)
        .controller('DocumentModalCtrl', DocumentModalCtrl)
        .directive('osetDocView', ViewDocumentDirective);

    function ViewDocumentDirective () {
        var directive = {
            link: link,
            template: documentTemplate,
            restrict: 'E',
            scope: {
                document: '=model',
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

    ViewDocDirectiveCtrl.$inject = ['modalService'];
    function ViewDocDirectiveCtrl (DocPreview) {
        var vm = this;

        vm.openPreview = showDocument;

        activate();

        // /

        function activate () {
            vm.btnText = vm.btnText || 'View';
        }

        function showDocument (document) {
            return DocPreview.show('modules/account/child_modules/lockbox/templates/modal-preview.html',
                'DocumentModalCtrl as vm',
                document);
        }
    }

    var documentTemplate = '<button class="button button-small" ng-click="vm.openPreview(vm.document)">{{vm.btnText}}</button>';


    // AKA: ContactDialogCtrl
    DocumentModalCtrl.$inject = ['parameters', '$sce', '$timeout', '$ionicPopup', 'LoadingService', 'PDFViewerService'];
    function DocumentModalCtrl (parameters, $sce, $timeout, $ionicPopup, LoadingService, PDFViewerService) {
        var vm = this;

        vm.document = parameters.document || parameters;
        vm.fullScreenMode = false;
        vm.modal = {
            height: 0,
            width: 0,
            initialHeight: 0,
            initialWidth: 0
        };

        vm.trustSrc = trustSrc;
        vm.onImageEvent = onImageEvent;
        vm.onPdfEvent = onPdfEvent;
        vm.loadProgress = loadProgress;
        vm.enlarge = enlarge;
        vm.minimize = minimize;
        vm.toggleFullScreen = toggleFullScreen;
        vm.close = close;

        function close (e) {
            e.stopPropagation();
            vm.closeModal(null);

            vm.fullScreenMode = false;
            if (angular.isFunction(screen.lockOrientation)) {
                screen.lockOrientation('portrait');
            }
        }

        function enlarge (e) {
            vm.fullScreenMode = !vm.fullScreenMode;
            if (angular.isFunction(screen.lockOrientation)) {
                screen.lockOrientation('landscape');
            }

            if (!_.isEmpty(vm.pdfInstance)) {
                $timeout(function () {
                    vm.pdfInstance.setScale(2);
                }, 500);
            }
        }

        function minimize () {
            vm.fullScreenMode = !vm.fullScreenMode;
            if (angular.isFunction(screen.lockOrientation)) {
                screen.lockOrientation('portrait');
            }

            if (!_.isEmpty(vm.pdfInstance)) {
                $timeout(function () {
                    vm.pdfInstance.reRender();
                }, 500);
            }
        }

        function toggleFullScreen () {
            if (!vm.fullScreenMode) return;
            vm.showControls = !vm.showControls;
        }

        logger.debug('Modal Visible for %s', vm.document.sku);

        var docURL = vm.document.url;

        if (docURL.indexOf('.pdf') > 0) {
            vm.viewerId = vm.document.id;
            vm.pdfURL = { src: vm.document.url };
        } else {
            vm.image = vm.document.url;
        }

        // logger.debug('Modal Visible for PDF: %s IMG: %o', vm.pdfURL, vm.image);

        logger.debug('[DocumentModalCtrl] for document: %o', vm.document);

        function trustSrc (src) {
            // logger.debug('SCE Trusting resource: `%s`', src);
            return $sce.trustAsResourceUrl(src);
        }


        function onImageEvent (type) {
            logger.debug('   **** onImageEvent  ' + type + ' ****');
            switch (type) {
                case 'loadStart':
                    LoadingService.showLoader('Loading Image, Please Wait.');
                    break;
                case 'loadComplete':
                    LoadingService.hide();
                    break;
                case 'loadError':
                    LoadingService.showAlert('Sorry, Please, try later.');
                    break;
                default:
                    logger.warn('Unknown Image Event: `%s`', type);
                    LoadingService.hide();
                    break;
            }
        }


        function onPdfEvent (type) {
            logger.debug('   **** ' + type + ' ****');
            switch (type) {
                case 'loadStart':
                    LoadingService.showLoader('Loading PDF, Please Wait.');
                    break;
                case 'loadComplete':
                    LoadingService.hide();
                    vm.pdfInstance = PDFViewerService.Instance(vm.viewerId);
                    break;
                case 'loadError':
                    LoadingService.showAlert('Sorry, Please, try later.');
                    break;
                default:
                    logger.warn('Unknown PDF Event: `%s`', type);
                    LoadingService.hide();
                    break;
            }
        }


        function loadProgress (loaded, total, state) {

            var progress = Math.ceil(loaded / total * 100);
            if (progress <= 100) {
                vm.loadingProgress = Math.ceil(loaded / total * 100);
            }
        }
    }


})();
