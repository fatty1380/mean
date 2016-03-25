(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .factory('modalService', modalService);

    modalService.$inject = ['$ionicModal', '$rootScope', '$q', '$controller', '$cordovaGoogleAnalytics', 'LoadingService'];

    function modalService ($ionicModal, $rootScope, $q, $controller, $cordovaGoogleAnalytics, LoadingService) {

        return {
            show: show
        };

        function show (templateUrl, controller, parameters, options) {

            var start = Date.now();
            var ctrl = _.first(controller.split(' '));
            var page = _.last(templateUrl.split('/'));
            var evt = ctrl + '@' + page;

            $cordovaGoogleAnalytics.trackEvent('ModalView', 'show', evt);

            $cordovaGoogleAnalytics.trackView(evt);

            var deferred = $q.defer();
            var ctrlInstance;
            var modalScope = $rootScope.$new();
            var thisScopeId = modalScope.$id;

            var defaultOptions = {
                animation: 'none',
                focusFirstInput: false,
                backdropClickToClose: true,
                hardwareBackButtonClose: true,
                modalCallback: null
            };

            options = angular.extend({}, defaultOptions, options);

            $ionicModal.fromTemplateUrl(templateUrl, {
                scope: modalScope,
                animation: options.animation,
                focusFirstInput: options.focusFirstInput,
                backdropClickToClose: options.backdropClickToClose,
                hardwareBackButtonClose: options.hardwareBackButtonClose
            })
                .then(function success (modal) {
                    modalScope.modal = modal;

                    modalScope.openModal = function openModal () {
                        return modalScope.modal.show();
                    };
                    modalScope.cancelModal = function cancelModal (result) {
                        deferred.reject(result);

                        $cordovaGoogleAnalytics.trackTiming('ModalView', Date.now() - start, 'cancel', evt);
                        $cordovaGoogleAnalytics.trackView(location.hash);

                        return modalScope.modal.hide();
                    };
                    modalScope.closeModal = function closeModal (result) {
                        deferred.resolve(result);
                        $cordovaGoogleAnalytics.trackTiming('ModalView', Date.now() - start, 'close', evt);
                        $cordovaGoogleAnalytics.trackView(location.hash);
                        return modalScope.modal.hide();
                    };

                    modalScope.$on('modal.hidden', function (thisModal) {
                        if (thisModal.currentScope) {
                            var modalScopeId = thisModal.currentScope.$id;
                            if (thisScopeId === modalScopeId) {
                                deferred.resolve(null);
                                _cleanup(thisModal.currentScope);
                            }
                        }
                    });

                        // Invoke the controller
                    var locals = { '$scope': modalScope, 'parameters': parameters };
                    var ctrlEval = _evalController(controller);

                    ctrlInstance = $controller(controller, locals);

                    if (ctrlEval.isControllerAs) {
                        _.extend(ctrlInstance, modalScope);
                    }

                    modalScope.modal.show()
                            .then(function () {
                                modalScope.$broadcast('modal.afterShow', modalScope.modal);

                                logger.debug('Modal Did finish loading', ctrlInstance);
                                LoadingService.hide();
                            });

                    if (angular.isFunction(options.modalCallback)) {
                        options.modalCallback(modal);
                    }

                })
                .catch(
                    function rejection (err) {
                        deferred.reject(err);
                        modalScope.modal && modalScope.modal.hide();
                    });

            return deferred.promise;
        }

        function _cleanup (scope) {
            scope.$destroy();
            if (scope.modal) {
                scope.modal.remove();
            }
        }

        function _evalController (ctrlName) {
            var result = {
                isControllerAs: false,
                controllerName: '',
                propName: ''
            };
            var fragments = (ctrlName || '').trim().split(/\s+/);
            result.isControllerAs = fragments.length === 3 && (fragments[1] || '').toLowerCase() === 'as';
            if (result.isControllerAs) {
                result.controllerName = fragments[0];
                result.propName = fragments[2];
            } else {
                result.controllerName = ctrlName;
            }

            return result;
        }

    }

})();
