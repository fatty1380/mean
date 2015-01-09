(function () {
    'use strict';


    function ReportDetailsController(report, applicant, appConfig, auth, Applicants, $log) {
        var vm = this;

        vm.report = report;
        vm.model = applicant || {};

        vm.introText = 'To get started, you will need to provide us with some information. We\'ll do our best to fill in what we already know, and won\'t make you fill it out again.';
        vm.getStartedText = 'Each report type requires different information. Please fill in the following fields in order to continue';

        vm.report.fields.map(translateFieldsToNg);

        //vm.applicant = applicant || {};
        //if (!vm.applicant.hasOwnProperty('remoteData')) {
        //    vm.report.fields.map(createApplicantModel);
        //} else {
        //    vm.model = applicant.remoteData;
        //}

        function createApplicantModel(field) {
            switch (field.type) {
                case 'array':
                    vm.applicant[field.name] = [];
                    break;
                case 'object':
                    vm.applicant[field.name] = {};
                    break;
                default:
                    vm.applicant[field.name] = '';
            }
        }

        function translateFieldsToNg(field) { // jshint ignore:line

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
                    var d = vm.model[field.name];
                    var format = 'YYYYMMDD';

                    if (!!d && d.length > 8) {
                        if (d.length <= 10 && (/[-\/]/).test(d)) {
                            format = d.replace(/\d{4}/, 'YYYY').replace(/\d{2}/, 'MM').replace(/\d{2}/, 'DD');
                        } else {

                            var m;
                            if (!!(m = moment(d)).toArray().splice(3).reduce(function (p, n) {
                                    return p + n;
                                })) {
                                $log.error('Unsure How to Handle "date" string: %s', d);
                                // Assume that we are in (EST:UTC-5)
                                vm.model[field.name] = moment.utc(d).subtract(5, 'hours');
                            } else {
                                $log.error('Treating %s as date-only with default format', d);
                                vm.model[field.name] = m.format(format);
                            }

                        }
                    }
                    else if (!d) {
                        vm.model[field.name] = '';
                    }


                    field.isDate = true;
                    field.format = format;

                    break;
                case 'state':
                    if (!vm.states) {
                        vm.states = appConfig.getStates();
                    }
                    break;
                case 'country':
                    if (!vm.countries) {
                        vm.countries = appConfig.getCountries();
                    }
                    break;
                case 'object':
                    if (field.dataFields) {
                        field.dataFields.map(translateFieldsToNg);
                    }
                    field.isObject = true;
                    break;
                case 'array':
                    if (field.dataFields) {
                        field.dataFields.map(translateFieldsToNg);
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

        vm.submit = function submit(event) {
            debugger;

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

                vm.error = err.message || err.data.message;
                return false;
            });
        };

    }

    function capFilter() {
        return function (input, all) {
            return (
                !!input ?
                    (input
                        .replace('/_/g', ' ') // Replace Underscores
                        .replace('/[a-z][A-Z]/g', function (txt) { // Split Camel Case
                            console.log('Text from "%s" to "%s"', txt, txt.charAt(0) + ' ' + txt.charAt(1));
                            return txt.charAt(0) + ' ' + txt.charAt(1);
                        })
                        .replace(/([^\W_]+[^\s-]*) */g, function (txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        })
                    )
                    : '');
        };
    }

    angular.module('core')
        .filter('titlecase', capFilter);

    function Ctrl($scope) {
        $scope.msg = 'hello, world.';
    }

    ReportDetailsController.$inject = ['report', 'applicant', 'AppConfig', 'Authentication', 'Applicants', '$log'];
    angular.module('bgchecks')
        .controller('ReportDetailsController', ReportDetailsController);

})();
