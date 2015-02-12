(function() {
    'use strict';

    function HtmlEditDirective() {
        return {
            priority: 0,
            template: '<text-angular ng-model="vm.model" required="vm.required"></text-angular>',
            replace: false,
            restrict: 'E',
            scope: {
                model: '=',
                toolbar: '=?',
                osRequired: '=?'
            },
            controllerAs: 'vm',
            bindToController: true,
            controller: function($scope, $element, $attrs, $transclude) {
                var vm = this;
                var toolbar = vm.toolbar || [['bold', 'italics', 'underline'], ['ul','ol'], ['justifyLeft', 'justifyCenter']];

                if(!_.isUndefined(vm.osRequired) && !!vm.osRequired) {
                    debugger;
                    vm.required = !!vm.osRequired;
                }
            }
        };
    }

    function TextAngularProvider($provide){
        // this demonstrates how to register a new tool and add it to the default toolbar
        $provide.decorator('taOptions', ['$delegate', function(taOptions){
            // $delegate is the taOptions we are decorating
            // here we override the default toolbars and classes specified in taOptions.
            taOptions.toolbar = [
                ['bold', 'italics', 'underline'],
                ['ul','ol'],
                ['justifyLeft','justifyCenter'],
                ['h3','p']
            ];
            taOptions.classes = {
                focussed: 'focused',
                toolbar: 'btn-toolbar',
                toolbarGroup: 'btn-group',
                toolbarButton: 'ta-toolbar-btn btn btn-cta-toolbar',
                toolbarButtonActive: 'active',
                disabled: 'disabled',
                textEditor: 'form-control',
                htmlEditor: 'form-control'
            };
            return taOptions; // whatever you return will be the taOptions
        }]);
        // this demonstrates changing the classes of the icons for the tools for font-awesome v3.x
        $provide.decorator('taTools', ['$delegate', function(taTools) {
            taTools.h3.iconclass = 'fa fa-font';
            delete taTools.h3.buttontext;

            taTools.p.buttontext = 'a';
            delete taTools.p.iconclass;

            return taTools;
        }]);
    }

    TextAngularProvider.$inject = ['$provide'];

    angular.module('core')
        .config(TextAngularProvider)
        .directive('osHtmlEdit', HtmlEditDirective)


})();

