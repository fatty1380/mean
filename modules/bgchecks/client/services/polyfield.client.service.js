(function () {
    'use strict';

    var fieldTranslations = function (AppConfig) {
        var _this = this;

        _this.data = {

            /**
             * translateFields: Translates fields from the eVerifile format into Ng format
             * for use in custom forms.
             * @param field
             * @param index
             * @param _vm
             * @returns {*}
             */
            translateWithThis: function (thisArg, field) {
                return _this.data.translateFields.call(thisArg, field);
            },
            translateFields: function (field, index, _vm) {
                var model = this.subModel || this.model || this;

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
                        debugger;
                        field.isState = true;
                        field.options = AppConfig.getStates();
                        break;
                    case 'country':
                        field.isCountry = true;
                        break;
                    case 'object':
                        if (field.dataFields && !!model) {
                            this.subModel = model[field.name];
                            _.map(field.dataFields, _this.data.translateFields, this);
                            this.subModel = null;
                        }
                        field.isObject = true;
                        break;
                    case 'array':
                        if (field.dataFields && !!model) {
                            this.subModel = model[field.name];
                            _.map(field.dataFields, _this.data.translateFields, this);
                            this.subModel = null;
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
            }
        };

        return _this.data;
    };

    fieldTranslations.$inject = ['AppConfig'];

    angular.module('bgchecks')
        .factory('PolyFieldService', fieldTranslations);
})();
