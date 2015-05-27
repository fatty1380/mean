/**
 * ngSignaturePad - v0.1.0 - 2013-12-02
 * https://github.com/marcorinck/ngSignaturePad
 * Copyright (c) 2013 ; Licensed MIT
 */
angular.module('ngSignaturePad', []);
angular.module('ngSignaturePad').directive('signaturePad', [
    '$window',
    function ($window) {
        "use strict";

        var signaturePad, canvas, scope, element, EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

        function calculateHeight($element) {
            return parseInt($element.css('height') || element[0].clientHeight, 10) - 70;
        }

        function calculateWidth($element) {
            return parseInt($element.css('width') || element[0].clientWidth, 10) - 25;
        }

        function setCanvasHeightAndWidth() {
            var height = calculateHeight(element), width = calculateWidth(element);

            scope.vm.signatureWidth = width;
            scope.vm.signatureHeight = height;
            canvas.attr("height", height);
            canvas.attr("width", width);
        }

        $window.addEventListener("resize", function () {
            scope.$apply(function () {
                var img = signaturePad.toDataURL();
                setCanvasHeightAndWidth();
                signaturePad.fromDataURL(img);
            });
        }, false);

        $window.addEventListener("orientationchange", function () {
            scope.$apply(function () {
                var img = signaturePad.toDataURL();
                setCanvasHeightAndWidth();
                signaturePad.fromDataURL(img);
            });
        }, false);


        return {
            restrict: 'A',
            replace: true,
            template: '<div class="signature-background">' +
            '<div class="signature" ng-style="{height: vm.signatureHeight, width: vm.signatureWidth}" >' +
            '<canvas></canvas>' +
            '</div>' +
            '<div class="action row pad-vert">' +
            '<div class="col-sm-12">' +
            '<div ng-show="!!vm.signature.timestamp"><strong>Signed:</strong> {{vm.signature.timestamp | amDateFormat : "LL LT"}}</div>' +
            '<button type="button" class="btn btn-oset-primary mgn-right pull-right" ng-class="{\'disabled\':!!timestamp}" ng-click="vm.methods.accept()">Sign</button>' +
            '<button type="button" class="btn btn-oset-link mgn-right pull-right" ng-click="vm.methods.clear()">clear</button>' +
            '</div>' +
            '</div>' +
            '</div>',
            scope: {
                signature: "=signature",
                close: "&",
                methods: "=?"
            },
            controllerAs: 'vm',
            bindToController: true,
            controller: function () {
                var vm = this;

                vm.methods = vm.methods || {};

                vm.methods.accept = function () {
                    if(!!vm.signature.timestamp && vm.signature.dataUrl !== EMPTY_IMAGE) {
                        console.log('Signature already signed');
                    }
                    else if (!signaturePad.isEmpty()) {
                        vm.signature.dataUrl = signaturePad.toDataURL();

                        vm.signature.timestamp = moment();
                    } else {
                        vm.signature.dataUrl = EMPTY_IMAGE;
                        vm.signature.timestamp = null;
                    }
                    vm.methods.close();
                };

                vm.methods.isEmpty = function() {
                    return signaturePad.isEmpty() && vm.signature.dataUrl === EMPTY_IMAGE;
                }

                vm.methods.clear = function () {
                    signaturePad.clear();
                    vm.signature.timestamp = null;
                    //setCanvasHeightAndWidth();
                };

                vm.methods.close = vm.close;
            },
            link: function (isoscope, $element) {
                canvas = $element.find("canvas");
                scope = isoscope;
                element = $element;
                signaturePad = new SignaturePad(canvas[0]);

                setCanvasHeightAndWidth();

                scope.vm.signature = scope.vm.signature || {};

                if (scope.vm.signature && !scope.vm.signature.$isEmpty && scope.vm.signature.dataUrl) {
                    debugger;
                    signaturePad.fromDataURL(scope.vm.signature.dataUrl);
                }

                scope.$watch('vm.signature', function(newVal, oldVal, scope) {

                    if(newVal.dataUrl !== oldVal.dataUrl) {
                        if (scope.vm.signature && !scope.vm.signature.$isEmpty && scope.vm.signature.dataUrl) {
                            signaturePad.fromDataURL(scope.vm.signature.dataUrl);
                        }
                    }
                })
            }
        };
    }
]);
