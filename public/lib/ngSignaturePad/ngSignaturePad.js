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

            scope.signatureWidth = width;
            scope.signatureHeight = height;
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
            '<div class="signature" ng-style="{height: signatureHeight, width: signatureWidth}" >' +
            '<canvas></canvas>' +
            '</div>' +
            '<div class="action row pad-vert">' +
            '<div class="col-sm-12">' +
            '<div ng-show="!!signature.timestamp"><strong>Signed:</strong> {{signature.timestamp | amDateFormat : "LL LT"}}</div>' +
            '<button type="button" class="btn btn-oset-secondary mgn-right pull-right" ng-click="clear()">clear</button>' +
            '<button type="button" class="btn btn-oset-primary mgn-right pull-right" ng-class="{\'disabled\':!!timestamp}" ng-click="accept()">Sign</button>' +
            '</div>' +
            '</div>' +
            '</div>',
            scope: {
                signature: "=signature",
                close: "&"
            },
            controller: function ($scope) {
                $scope.accept = function () {
                    if (!signaturePad.isEmpty()) {
                        $scope.signature.dataUrl = signaturePad.toDataURL();
                        $scope.signature.$isEmpty = false;

                        $scope.signature.timestamp = moment();
                    } else {
                        $scope.signature.dataUrl = EMPTY_IMAGE;
                        $scope.signature.timestamp = null;
                        $scope.signature.$isEmpty = true;
                    }
                    $scope.close();
                };

                $scope.clear = function () {
                    signaturePad.clear();
                    $scope.signature.timestamp = null;
                    //setCanvasHeightAndWidth();
                };
            },
            link: function ($scope, $element) {
                canvas = $element.find("canvas");
                scope = $scope;
                element = $element;
                signaturePad = new SignaturePad(canvas[0]);

                setCanvasHeightAndWidth();

                $scope.signature = $scope.signature || {};

                if ($scope.signature && !$scope.signature.$isEmpty && $scope.signature.dataUrl) {
                    signaturePad.fromDataURL($scope.signature.dataUrl);
                }
            }
        };
    }
]);
