(function () {
    'use strict';


    function completeApplicantModel(field) {
        var vm = this; // jshint ignore:line

        var model = vm.model;
        var source = vm.applicant;

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
        var vm = this; // jshint ignore:line
        var model = vm.subModel || vm.model;

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
                    vm.subModel = model[field.name];
                    _.map(field.dataFields, translateFieldsToNg, vm);
                    vm.subModel = null;
                }
                field.isObject = true;
                break;
            case 'array':
                if (field.dataFields) {
                    vm.subModel = model[field.name];
                    _.map(field.dataFields, translateFieldsToNg, vm);
                    vm.subModel = null;
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

    function ReportDetailsController(report, applicant, appConfig, auth, Applicants, $log, $state, $modal, $document) {
        var vm = this;

        vm.debugMode = appConfig.get('debug');


        vm.report = report;
        vm.applicant = applicant;
        vm.config = appConfig;

        vm.model = {};

        vm.verify = false;
        vm.pay = false;

        vm.introText = 'All reports are run by leading verification company, eEverifile. Outset will never store your Social Security , Driver License or Credit Card numbers.';
        vm.getStartedText = 'All required fields are <b>Marked in Bold</b>';
        vm.correctErrorsText = 'Please review any answers that are <span class="cta-outline">marked in red</span> below.';
        vm.createText = 'Please review your information and click continue when ready. Please note, that this may take a moment to complete.';
        vm.payExplanation = 'Please click continue to enter your payment information';


        vm.states = null;
        vm.countries = null;

        function activate() {
            if (!!vm.applicant && !!vm.applicant.remoteId) {
                console.log('adding remote applicant id [%d] to model', vm.applicant.remoteId);
                vm.model.applicantId = vm.applicant.remoteId;
            }

            vm.price = vm.report.promo || vm.report.price;

            vm.report.fields.map(completeApplicantModel, vm);
            _.map(vm.report.fields, translateFieldsToNg, vm);


            if (!vm.states) {
                vm.states = vm.config.getStates();
            }
            if (!vm.countries) {
                vm.countries = vm.config.getCountries();
            }
        }

        /**
         * Handles the initial applicant creation & update
         * After return, either invalidates teh form (error),
         * Or sets the form into "verify" state
         * */
        vm.saveForm = function (event) {
            vm.disabled = true;

            $document.scrollTopAnimated(0, 300);

            if (vm.reportForm.$invalid) {
                vm.error = 'Please correct all errors above';
                vm.disabled = false;
                return false;
            }

            vm.error = vm.success = null;

            vm.disabled = vm.creating = false;
            vm.verify = true;

        };

        vm.submitApplicant = function (event) {
            vm.disabled = vm.creating = true;
            vm.error = vm.success = null;

            vm.showSpinner();

            var applicantRsrc = new Applicants.FromForm(vm.model, auth.user._id);

            $log.debug('Creating new applicant Rsrc with data: %o', applicantRsrc);

            applicantRsrc.$save(function (response) {

                if (response.updated) {

                    console.log('Successfully updated existing applicant: %j', response);
                }
                else {
                    console.log('SUCCESS! Created new Applicant: %o', response);
                }

                vm.success = 'Applicant data has been verified on the server!';

                vm.error = null;


                $state.go('reportpayments', {'sku': vm.report.sku});

                vm.spinnerModal.dismiss('done');

            }, function (err) {
                if (err) {
                    $log.error('failed to create applicant: %o', err);

                }
                vm.spinnerModal.dismiss('done');

                vm.error = 'Sorry, but something went wrong trying to create your report applicant. Please try again later';

                vm.disabled = false;
                vm.error = err.message || err.data && err.data.message;
                return false;
            });
        };

        vm.goBack = function () {
            vm.verify = vm.creating = vm.ispay = false;
            vm.success = vm.error = null;
        };

        vm.showSpinner = function () {
            vm.spinnerModal = $modal.open({
                templateUrl: 'spinnerModal.html',
                backdrop: 'static',
                controller: ['$timeout', function ($timeout) {
                    var vm = this;
                    vm.textStatuses = [
                        {text: 'Connecting to eVerifile', timeout: 1750},
                        {text: 'Validating Security', timeout: 1250},
                        {text: 'Confirming Identity', timeout: 2000},
                        {text: 'Storing Information', timeout: 10000},
                        {text: 'Finalizing Report Data', timeout: 1000}
                    ];

                    vm.uploadStatusText = vm.textStatuses[0].text;

                    vm.updateStatus = function (i) {
                        $timeout(function () {
                            i++;
                            if (i < vm.textStatuses.length) {
                                vm.uploadStatusText = vm.textStatuses[i].text;

                                vm.updateStatus(i);
                            }

                        }, vm.textStatuses[i].timeout);
                    };

                    vm.updateStatus(0);


                }],
                controllerAs: 'vm',
                bindToController: true
            });
        };


        vm.getPriceString = function (price) {
            var base = Number(price);
            var next = base.toFixed(2);
            return '$' + next;
        };

        activate();
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
            return (!!input) ? moment(input, format).format('L') : '';
        };
    }

    angular.module('core')
        .filter('titlecase', capFilter)
        .filter('prettyPrint', prettyPrint)
        .filter('isoDatePrint', isoDateFilter);

    ReportDetailsController.$inject = ['report', 'applicant', 'AppConfig', 'Authentication', 'Applicants', '$log', '$state', '$modal', '$document'];
    angular.module('bgchecks')
        .controller('ReportDetailsController', ReportDetailsController);

})();
