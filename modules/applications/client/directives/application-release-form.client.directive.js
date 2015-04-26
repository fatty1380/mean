(function () {
    'use strict';

    function ApplicationReleaseFormCtrl($log, $q, $interpolate, Applications) {
        var vm = this;

        vm.signatureMethods = {};

        vm.text = _.defaults(vm.text || {}, {
            about: null
        });

        vm.releaseTypes = {
            'preEmployment': {
                text: '<p class="strong text-center"><u>DISCLOSURE AND AUTHORIZATION TO OBTAIN CONSUMER AND/OR INVESTIGATIVE CONSUMER REPORT</u></p>' +
                '<p>I, the undersigned, hereby consent and authorize <em class="strong">{{vm.companyName}}</em>, its ' +
                'affiliated companies, and/or its agents (collectively, herein after referred to as “ Company”) to ' +
                'obtain information about me from a consumer reporting agency for purposes permitted under the Fair ' +
                'Credit Reporting Act 15 U.S.C.1681 including employment purposes, a business transaction initiated ' +
                'by me, or upon my written instructions . I understand that this means that a “consumer report” ' +
                'and/or an “investigative consumer report” may be requested which may include information regarding ' +
                'my character, general reputation, personal characteristics and mode of living, whichever are ' +
                'applicable. The report may also contain information relating to my criminal history, credit history, ' +
                'motor vehicle records such as driving records, social security verification, verification of ' +
                'education or employment history or other background checks. This may involve personal interviews ' +
                'with sources such as neighbors, friends or associates. These reports may be obtained at any time ' +
                'after receipt of my authorization, and if I am hired or engaged to transact business with the ' +
                'Company, throughout my employment or relationship with the Company. I understand I have the right, ' +
                'upon written request made within a reasonable time after receipt of this notice, to request ' +
                'disclosure of the nature and scope of any investigative consumer report to e-Verifile, 900 Circle 75 ' +
                'Parkway, Suite 1550, Atlanta, GA 30339 – 770-859-9899. For information about e-Verifile’s privacy ' +
                'practices see www.e-verifile.com. The scope of this notice and authorization is not limited to the ' +
                'present and, if hired or engaged to transact business with the Company, will continue and allow the ' +
                'Company to conduct future screenings for retention, promotion, reassignment access to the Company’s ' +
                'premises or for a continuing relationship with the Company, unless revoked by me in writing. The ' +
                'Company also reserves the right to share the information contained in the report(s) with any ' +
                'third-party companies for whom I will be placed to work or with whom I will have a relationship or ' +
                'will have access to the premises. My information will only be used and/or disclosed as permitted by ' +
                'law and as required for creation of any report(s).</p>' +


                '<p class="strong"> I HEREBY CERTIFY THAT THIS FORM WAS COMPLETED BY ME, THAT THE INFORMATION PROVIDED ' +
                'IS TRUE AND CORRECT AS OF THE DATE HEREOF AND I AUTHORIZE E-VERIFILE TO OBTAIN A CONSUMER REPORT ' +
                'AND/OR INVESTIGATIVE CONSUMER REPORT ON ME, AS APPLICABLE. I acknowledge that the Company has provided ' +
                'with a copy of <a href="https://www.consumer.ftc.gov/articles/pdf-0096-fair-credit-reporting-act.pdf" ' +
                'target="_blank">A Summary of Your Rights Under the Fair Credit Reporting Act</a>. </p>'
            }
        };

        vm.methods = _.defaults({
            init: function () {
                vm.companyName = vm.gateway.models.company.legalEntityName || vm.gateway.models.company.name;

                vm.releaseAuthForm.$addControl('signature');

                vm.updateSignatureStatus();

                return $q.all({gw: vm.gateway.applicantGateway, app: vm.gateway.application, rel: vm.gateway.releases}).then(
                    function (values) {
                        vm.application = values.app;
                        vm.releaseType = values.gw.releaseType;
                        vm.releaseText = $interpolate(vm.releaseTypes[vm.releaseType].text)({vm:vm});

                        vm.releases = _.indexBy(_.where(values.rel, function (val) {
                            return !_.isEmpty(val && val.releaseType);
                        }), 'releaseType') || {};

                        var currentRelease = vm.releases[vm.releaseType];
                        // Search for existing Releases of the same type, otherwise create a stub;
                        vm.release = currentRelease || {
                            releaseType: vm.releaseType,
                            signature: {},
                            name: {},
                            releaseText: vm.releaseText
                        };

                        vm.existingRelease = _.cloneDeep(currentRelease);
                    }
                );
            },
            submit: function () {
                var application = vm.application;

                if(_.isEqual(vm.release, vm.existingRelease)) {
                    $log.debug('Existing release was unchanged ... submit complete');
                    return $q.when(vm.application);
                }

                vm.releases[vm.releaseType] = vm.release;

                application.releases = _.values(vm.releases);

                if (_.isEmpty(application._id)) {
                    application = new Applications.ByJob(application);

                    application.jobId = vm.gateway.models.job._id;

                    return application.$save().then(function (success) {
                        $log.debug('Created a new Application! %o', success);

                        vm.gateway.application = success;

                        return success;
                    });
                }
                else {
                    application = new Applications.ById(application);

                    return application.$update().then(function (success) {
                        $log.debug('Updated an existing Application! %o', success);

                        vm.gateway.application = success;

                        return success;
                    });
                }

            },
            validate: function () {
                vm.releaseAuthForm.$setSubmitted(true);

                if(_.isFunction(vm.signatureMethods.accept)) {
                    vm.signatureMethods.accept();
                }

                vm.updateSignatureStatus();

                if (!vm.isSigValid) {
                    return $q.reject('Please enter your e-signature in the space provided');
                }

                if (vm.releaseAuthForm.$error.required) {
                    return $q.reject('Please enter values for all required fields on the form');
                }

                if (vm.releaseAuthForm.dateOfBirth.$invalid) {
                    return $q.reject('Please enter a valid date on the form');
                }

                var dob = moment(vm.release.dob);

                if (_.isEmpty(vm.release.dob) || !dob) {
                    return $q.reject('Please enter a valid date on the form');
                }

                return $q.when(true);

            }
        }, vm.methods);

        vm.updateSignatureStatus = function () {
            var isSigNull = !vm.release || _.isEmpty(vm.release.signature);
            var isSigEmpty = isSigNull || vm.signatureMethods.isEmpty();

            vm.isSigValid = !(isSigNull || isSigEmpty);
        };

        vm.dateChanged = function (val) {
            debugger;


        };

        $q.when(vm.report).then(vm.methods.init);
    }

    ApplicationReleaseFormCtrl.$inject = ['$log', '$q', '$interpolate', 'Applications'];

    function ApplicationReleaseFormDirective() {
        return {
            templateUrl: '/modules/applications/views/form/authorization.client.template.html',
            restrict: 'E',
            require: ['^form'],
            scope: {
                gateway: '=?',
                text: '=?',
                methods: '=?',
                release: '=?model'
            },
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
                scope.vm.releaseAuthForm = scope.vm.form['releaseAuthForm'];
            },
            controller: 'ApplicationReleaseFormController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    angular.module('drivers')
        .controller('ApplicationReleaseFormController', ApplicationReleaseFormCtrl)
        .directive('applicationReleaseForm', ApplicationReleaseFormDirective);
})();
