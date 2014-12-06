(function() {
    'use strict';

    function ExperienceDirectiveController($scope, $element, $attrs, $transclude) {
        this.editMode = typeof this.editMode === undefined ? true : !!this.editMode;
        this.editEnable = typeof this.editEnable === undefined ? true : !!this.editEnable;

        this.pristine = angular.copy(this.model);

        this.edit = function() {
            this.pristine = angular.copy(this.model);
            this.editMode = true;
        };

        this.cancel = function() {
            if (this.model.isFresh) {
                // This is a brand-new experience object
                if (this.dropFn) {
                    this.dropFn(this.model);
                } else {
                    this.model = null;
                }
            } else {
                this.model = angular.copy(this.pristine);
            }

            this.editMode = false;
        };


        this.save = function(options) {
            if (options) {
                if (!!options.add && !!this.addFn) {
                    this.addFn();
                }
            }

            this.editMode = false;
        };
    }

    function ExperienceDirective() {
        return {
            priority: 0,
            templateUrl: 'modules/drivers/views/templates/experience.client.template.html',
            replace: false,
            restrict: 'E',
            scope: {
                model: '=',
                editMode: '=?',
                editEnable: '=?',
                addFn: '&?',
                dropFn: '&?'
            },
            controller: ExperienceDirectiveController,
            controllerAs: 'expctrl',
            bindToController: true
        };
    }

    ExperienceDirectiveController.$inject = ['$scope', '$element', '$attrs', '$transclude'];

    angular.module('drivers').directive('osDriverExperience', ExperienceDirective);


})();
