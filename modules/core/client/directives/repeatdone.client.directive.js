(function () {
    'use strict';
    angular.module('core').directive('onRepeatDone', function ($timeout) {
        return {
            restriction: 'A',
            link: function ($scope, element, attributes) {
                if ($scope.$last === true) {
                    $timeout(function () {
                        $scope.$emit(attributes.onRepeatDone || 'repeat_done', element);
                    });
                }
            }
        };
    });
})();
