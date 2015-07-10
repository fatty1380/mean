(function () {
    'use strict';

    var fieldTranslations = function (AppConfig) {
        var _data = this;

        _data.methods = {

            /**
             * translateFields: Translates fields from the eVerifile format into Ng format
             * for use in custom forms.
             * @param field
             * @param index
             * @param _vm
             * @returns {*}
             */
            translateWithThis: function (thisArg, field) {
                return _data.methods.translateFields.call(thisArg, field);
            },
            translateFields: function(fields, model) {
                _.map(fields, mapTranslateFields, { model : model });
            },
            completeModel: function(fields, model) {
                _.map(fields, mapSourceToModel, { model : model });
            }
        };

        var mapTranslateFields = function (field, index) {
            var model = this.model;

            switch (field.type) {
                case 'string':
                    if (!!field.pickList) {
                        field.isPickList = true;
                        break;
                    }
                    field.ngType = 'text';
                    field.ngMaxLength = field.length;
                    break;

                case 'text':
                    field.isTextArea = true;
                    break;

                case 'radio':
                    field.isRadio = true;
                    break;

                case 'checkbox':
                    field.isCheckbox = true;
                    break;

                case 'datelong':
                    // TODO: Fix this code once format is known
                    var format = 'YYYYMMDD';

                    if (!!model) {
                        var d = model[field.name];

                        if (!!d && d.length > 8) {
                            if (d.length <= 10 && (/[-\/]/).test(d)) {
                                format = d.replace(/\d{4}/, 'YYYY').replace(/\d{2}/, 'MM').replace(/\d{2}/, 'DD');
                            } else {

                                var m;
                                if (!!(m = moment(d)).toArray().splice(3).reduce(function (p, n) {
                                        return p + n;
                                    })) {
                                    console.error('Unsure How to Handle "date" string: %s', d);
                                    // Assume that we are in (EST:UTC-5)
                                    model[field.name] = moment.utc(d).subtract(5, 'hours');
                                } else {
                                    console.error('Treating %s as date-only with default format', d);
                                    model[field.name] = m.format(format);
                                }

                            }
                        }
                        else if (!d) {
                            model[field.name] = '';
                        }
                    }

                    field.isDate = true;
                    field.format = format;

                    break;
                case 'state':
                    field.isState = true;
                    field.options = AppConfig.getStates();
                    break;
                case 'country':
                    field.isCountry = true;
                    break;
                case 'object':
                    if (field.dataFields && !!model) {
                        _data.methods.translateFields(field.dataFields, {model: model[field.name]});
                    }
                    field.isObject = true;
                    break;
                case 'array':
                    if (field.dataFields && !!model) {
                        _data.methods.translateFields(field.dataFields, {model: model[field.name]});
                    }
                    field.isArray = true;
                    field.values = field.values || [];
                    break;
            }

            var sensitive = /^governmentId|SSN$/i;

            if (sensitive.test(field.name) || sensitive.test(field.description)) {
                field.ngType = null;
                field.ngSensitive = true;
            }

            return field;
        };

        var mapSourceToModel = function(field) {
            var vm = this;

            if(!vm.model.hasOwnProperty(field.name)) {
                switch (field.type) {
                    case 'array':
                        vm.model[field.name] = [];
                        break;
                    case 'object':
                        vm.model[field.name] = {};
                        break;
                    default:
                        vm.model[field.name] = '';
                }
            }
        };

        return _data.methods;
    };

    fieldTranslations.$inject = ['AppConfig'];

    angular.module('bgchecks')
        .factory('PolyFieldService', fieldTranslations);
})();
