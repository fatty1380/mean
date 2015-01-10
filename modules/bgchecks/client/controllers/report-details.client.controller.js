(function () {
    'use strict';


    function completeApplicantModel(field) {
        var model = this.model;

        if (!model.hasOwnProperty(field.name)) {
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

    function translateFieldsToNg(field) { // jshint ignore:line

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
                if (!this.states) {
                    this.states = this.config.getStates();
                }
                break;
            case 'country':
                if (!this.countries) {
                    this.countries = this.config.getCountries();
                }
                break;
            case 'object':
                if (field.dataFields) {
                    field.dataFields.map(translateFieldsToNg, this);
                }
                field.isObject = true;
                break;
            case 'array':
                if (field.dataFields) {
                    field.dataFields.map(translateFieldsToNg, this);
                }
                field.isArray = true;
                field.values = field.values || [];
                break;
        }

        var sensitive = /^governmentId|SSN$/i;

        if (sensitive.test(field.name) || sensitive.test(field.description)) {
            field.ngSensitive = true;
            field.ngType = 'password';
        }

        return field;
    }

    function ReportDetailsController(report, applicant, appConfig, auth, Applicants, $log, $q) {
        var vm = this;

        vm.report = report;
        vm.model = applicant || {};
        vm.config = appConfig;

        vm.introText = 'To get started, you will need to provide us with some information. We\'ll do our best to fill in what we already know, and won\'t make you fill it out again.';
        vm.getStartedText = 'Each report type requires different information. Please fill in the following fields in order to continue';

        vm.report.fields.map(translateFieldsToNg, vm);
        vm.report.fields.map(completeApplicantModel, vm);

        /**
         * Handles the initial applicant creation & update
         * After return, either invalidates teh form (error),
         * Or sets the form into "verify" state
         * */
        vm.submit = function submit(event) {

            debugger;

            if(vm.reportForm.$invalid) {
                vm.error = 'Please correct all errors above';
                return false;
            }

            vm.model.userId = auth.user._id;

            var applicant = new Applicants.ByUser(vm.model);

            $log.debug('Creating new applicant with data: %o', applicant);

            applicant.$save(function (response) {
                console.log('SUCCESS! %s Applicant: %o', (response.updated ? 'Updated' : 'Created'), response);

                vm.response = response;
                vm.applicant = Applicants.get(response).catch(function (err) {
                    $log.error('unable to verify applicant due to error', err);
                    vm.error = err.message || err.data.message;
                    return false;
                });

                vm.verify = true;
            }, function (err) {
                if (err) {
                    $log.error('failed to create applicant: %o', err);
                }

                if('TODO: THIS IS AA WORKAROUND') {
                    $log.error('this is a workaround to test form validation!');

                    vm.verify = true;
                    vm.applicant = _.mapValues(vm.model, function(val) { console.log(val); return val; });
                    debugger;
                }

                vm.error = err.message || err.data.message;
                return false;
            });
        };

        vm.execute = function execute(event) {
            alert('yay');
        };

    }

    function capFilter() {
        return function (input, all) {
            return (!!input) ? /^[A-Z]+$/.test(input) ? input :
                input.replace(/_/g, ' ').replace(/[a-z][A-Z]/g, function (txt) { return txt.charAt(0) + ' ' + txt.charAt(1); })
                    .replace(/([^\W_]+[^\s-]*) */g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); })
                : '';
        };
    }

    angular.module('core')
        .filter('titlecase', capFilter);

    function Ctrl($scope) {
        $scope.msg = 'hello, world.';
    }

    ReportDetailsController.$inject = ['report', 'applicant', 'AppConfig', 'Authentication', 'Applicants', '$log', '$q'];
    angular.module('bgchecks')
        .controller('ReportDetailsController', ReportDetailsController);

})();
