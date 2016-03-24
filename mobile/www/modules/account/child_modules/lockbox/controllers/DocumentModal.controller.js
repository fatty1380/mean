(function () {
    'use strict';

    angular.module('lockbox')
        .controller('DocumentModalCtrl', DocumentModalCtrl);

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

        function enlarge () {
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
            if (!vm.fullScreenMode) {return;}
            vm.showControls = !vm.showControls;
        }

        logger.debug('Modal Visible for %s', vm.document.sku);

        var docURL = vm.document.url;

        if (docURL.indexOf('.pdf') > 0) {
            vm.viewerId = vm.document.id;
            vm.pdfURL = { src: vm.document.url };
        }
        else {
            vm.image = vm.document.url;
        }

        // logger.debug('Modal Visible for PDF: %s IMG: %o', vm.pdfURL, vm.image);

        logger.debug('[DocumentModalCtrl] for document: %o', vm.document);

        function trustSrc (src) {
            // logger.debug('SCE Trusting resource: `%s`', src);
            return $sce.trustAsResourceUrl(src);
        }


        function onImageEvent (event) {
            var type = event.type || event;
            var err = event.err;

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
                    logger.error('Image Event Errored', err);
                    break;
                default:
                    logger.warn('Unknown Image Event: `%s`', type);
                    LoadingService.hide();
                    break;
            }
        }


        function onPdfEvent (event) {
            var type = event.type || event;
            var err = event.err;

            logger.debug('   **** ' + type + ' ****', event);

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
                    logger.error('Image Event Errored', err);
                    break;
                default:
                    logger.warn('Unknown PDF Event: `%s`', type);
                    LoadingService.hide();
                    break;
            }
        }


        function loadProgress (loaded, total) {

            var progress = Math.ceil(loaded / total * 100);
            if (progress <= 100) {
                vm.loadingProgress = Math.ceil(loaded / total * 100);
            }
        }
    }


})();
