(function () {
    'use strict';


    function completeApplicantModel(field) {
        var model = this.model;
        var source = this.applicant;

        if (!model.hasOwnProperty(field.name)) {

            if (!!source && source.hasOwnProperty(field.name)) {
                model[field.name] = source[field.name];
            } else {
                switch (field.type) {
                    case 'array':
                        model[field.name] = [];
                        break;
                    case 'object':
                        model[field.name] = {};
                        break;
                    default:
                        model[field.name] = '';
                }
            }
        }
    }

    function translateFieldsToNg(field, index, _vm) { // jshint ignore:line
        var model = this.subModel || this.model;

        switch (field.type) {
            case 'string':
                if (!!field.pickList) {
                    field.isPickList = true;
                    break;
                }
                field.ngType = 'text';
                field.ngMaxLength = field.length;
                break;
            case 'datelong':
                // TODO: Fix this code once format is known
                var d = model[field.name];
                var format = 'YYYYMMDD';

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


                field.isDate = true;
                field.format = format;

                break;
            case 'state':
                field.isState = true;
                break;
            case 'country':
                field.isCountry = true;
                break;
            case 'object':
                if (field.dataFields) {
                    this.subModel = model[field.name];
                    _.map(field.dataFields, translateFieldsToNg, this);
                    this.subModel = null;
                }
                field.isObject = true;
                break;
            case 'array':
                if (field.dataFields) {
                    this.subModel = model[field.name];
                    _.map(field.dataFields, translateFieldsToNg, this);
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

    function ReportDetailsController(report, applicant, appConfig, auth, Applicants, $log, $q) {
        var vm = this;

        vm.debugMode = appConfig.get('debug');


        vm.report = report;
        vm.applicant = applicant;
        vm.config = appConfig;

        vm.model = {};

        vm.verify = false;
        vm.pay = false;

        vm.introText = 'To get started, you will need to provide us with some information. We\'ll do our best to store any information that you enter, but we will never store sensitive information such as your SSN or Driver License ID Number';
        vm.getStartedText = 'Each report type requires different information. Please fill in the following fields in order to continue. All required fields are <b>Marked in Bold</b>, and we will outline any fields that <span class="cta-outline">need your attention</span> in red.';
        vm.createText = 'Continuing from here will create a new piece of secure data in our system that we can use to run reports on your request. We will not run any reports without your further action. Please note, that this may take a moment to complete.';
        vm.payExplanation = 'Your information is now ready for you to order your report. Please continue to enter your payment information';


        vm.states = null;
        vm.countries = null;

        (function activate() {
            if (!!vm.applicant && !!vm.applicant.remoteId) {
                console.log('adding remote applicant id [%d] to model', vm.applicant.remoteId);
                vm.model.applicantId = vm.applicant.remoteId;
            }


            vm.report.fields.map(completeApplicantModel, vm);
            _.map(vm.report.fields, translateFieldsToNg, vm);


            if (!vm.states) {
                vm.states = vm.config.getStates();
            }
            if (!vm.countries) {
                vm.countries = vm.config.getCountries();
            }
        })();

        /**
         * Handles the initial applicant creation & update
         * After return, either invalidates teh form (error),
         * Or sets the form into "verify" state
         * */
        vm.saveForm = function (event) {

            if (vm.reportForm.$invalid) {
                vm.error = 'Please correct all errors above';
                vm.disabled = false;
                return false;
            }

            vm.error = vm.success = null;

            vm.disabled = false;
            vm.verify = true;

        };

        vm.submitApplicant = function (event) {
            vm.disabled = true;
            vm.error = vm.success = null;

            var applicantRsrc = new Applicants.FromForm(vm.model, auth.user._id);

            $log.debug('Creating new applicantRsrc with data: %o', applicantRsrc);

            applicantRsrc.$save(function (response) {

                // expecting either: {"updated":true,"applicantId":44679}
                //               or: {
                //                        "_id": "54b1d25b4840075d43112a95",
                //                            "remoteId": 44679,
                //                            "user": "54ad260e6274fe6514aa1b0d",
                //                            "__v": 1,
                //                            "modified": "2015-01-11T01:31:07.329Z",
                //                            "created": "2015-01-11T01:31:07.329Z",
                //                            "reports": [
                //                            "54b4f9e9c5e7ac00005ca0d3"
                //                        ],
                //                            "governmentId": "",
                //                            "remoteSystem": "everifile"
                //                    }

                if (response.updated) {

                    console.log('Successfully updated existing applicant: %j', response);
                }
                else {
                    console.log('SUCCESS! Created new Applicant: %o', response);
                }

                vm.success = 'Applicant data has been verified on the server!';

                vm.error = null;

                vm.disabled = false;
                vm.ispay = true;

            }, function (err) {
                if (err) {
                    $log.error('failed to create applicant: %o', err);

                }

                vm.disabled = false;
                vm.error = err.message || err.data && err.data.message;
                return false;
            });
        };

        vm.goBack = function () {
            vm.verify = vm.ispay = false;
            vm.success = vm.error = null;
        };
    }

    function capFilter() {
        return function (input, all) {
            return (!!input) ? /^[A-Z]+$/.test(input) ? input :
                input.replace(/_/g, ' ').replace(/[a-z][A-Z]/g, function (txt) {
                    return txt.charAt(0) + ' ' + txt.charAt(1);
                })
                    .replace(/([^\W_]+[^\s-]*) */g, function (txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    })
                : '';
        };
    }

    function prettyPrint() {
        return function (input) {
            return (!!input) ? JSON.stringify(input, undefined, 2) : '';
        };
    }

    function isoDateFilter() {
        return function (input, parseFmt) {
            var format = parseFmt || 'YYYYMMDD';
            return (!!input) ? moment(input,format).format('L') : '';
        };
    }

    angular.module('core')
        .filter('titlecase', capFilter)
        .filter('prettyPrint', prettyPrint)
        .filter('isoDatePrint', isoDateFilter);

    ReportDetailsController.$inject = ['report', 'applicant', 'AppConfig', 'Authentication', 'Applicants', '$log', '$q'];
    angular.module('bgchecks')
        .controller('ReportDetailsController', ReportDetailsController);

})();
