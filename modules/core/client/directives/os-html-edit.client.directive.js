(function () {
    'use strict';

    ApplicationConfiguration.registerModule('oset.tinymce');

    var editorConfig = {
        menubar: false,
        toolbar: [
            'undo redo | styleselect | fontsizeselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'
        ],
        statusbar: false,
        fontsize_formats: '10px 12px 14px 18px'
    };

    /**
     * Directive to wrap and bind the TinyMCE Editor for use by the app
     * Credit to : http://plnkr.co/edit/6OpbZM , http://plnkr.co/users/shidhincr
     * Linked from : https://jadendreamer.wordpress.com/2014/03/11/angular-ui-tutorial-tinymce-directive/
     * @param uiTinymceConfig
     * @returns {{require: string, link: Function}}
     * @constructor
     */
    function TinyMCEDirective($sce, $log, uiTinymceConfig) {
        uiTinymceConfig = uiTinymceConfig || {};

        var minimalConfig = {
            menubar: false,
            toolbar: false,
            statusbar: false
        };
        var generatedIds = 0;

        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ngModel) {
                var expression, options, tinyInstance;
                // generate an ID if not present
                if (!attrs.id) {
                    attrs.$set('id', 'uiTinymce' + generatedIds++);
                }
                options = {
                    // Update model when calling setContent (such as from the source editor popup)
                    setup: function (ed) {
                        ed.on('init', function (args) {
                            ngModel.$render();
                        });
                        // Update model on button click
                        ed.on('ExecCommand', function (e) {
                            ed.save();
                            ngModel.$setViewValue(elm.val());
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                        });
                        // Update model on keypress
                        ed.on('KeyUp', function (e) {
                            $log.debug('[TinyMce.model.KeyUp] IsDirty: %s', ed.isDirty());
                            ed.save();
                            ngModel.$setViewValue(elm.val());
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                        });
                    },
                    mode: 'exact',
                    elements: attrs.id
                };

                if (attrs.uiTinymce) {
                    expression = scope.$eval(attrs.uiTinymce);
                } else {
                    expression = {};
                }

                if (angular.isDefined(attrs.minimal)) {
                    uiTinymceConfig = minimalConfig;
                }

                angular.extend(options, uiTinymceConfig, expression);
                setTimeout(function () {
                    tinymce.init(options);
                });


                ngModel.$render = function () {
                    if (!tinyInstance) {
                        tinyInstance = tinymce.get(attrs.id);
                    }
                    if (tinyInstance) {
                        $sce.trustAsHtml(ngModel.$viewValue);
                        tinyInstance.setContent(ngModel.$viewValue || '');

                        if(angular.isDefined(attrs.class)) {
                            _.map(attrs.class.split(' '), function(c) {
                                if(!!c) {
                                    tinyInstance.getContentAreaContainer().classList.add(c);
                                }
                            });
                        }
                    }
                };
            }
        };
    }

    /**
     * Binds a TinyMCE widget to <textarea> elements.
     */
    angular.module('oset.tinymce', [])
        .value('uiTinymceConfig', editorConfig)
        .directive('osHtmlEdit', ['$sce', '$log', 'uiTinymceConfig', TinyMCEDirective]);

})();

