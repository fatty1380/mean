(function () {
    'use strict';

    var template = '<span><span ng-repeat="key in vm.endorsements" ' +
        'ng-init="description = vm.getEndorsementName(key)" ' +
        'ng-if="key"' +
        'class="endorsement label label-success" ' +
        'tooltip-popup-delay="750" ' +
        'uib-tooltip="{{description}}">{{key}}</span>' +
        '<span ng-if="!vm.filteredEndorsements.length">None</span></span>';

    function EndorsementDisplayDirective() {
        var ddo;

        ddo = {
            template: template,
            restrict: 'E',
            scope: {
                endorsements: '=model'
            },
            controller: function () {
                var vm = this;

                vm.filteredEndorsements = _.compact(_.keys(vm.endorsements).map(function (item) {
                    return (vm.endorsements[item]) ? item : null;
                }));

                vm.endorsementBase = [
                    {key: 'HME', description: 'Hazardous Materials', value: false},
                    {key: 'P', description: 'Passenger', value: false},
                    {key: 'S', description: 'School Bus', value: false},
                    {key: 'T', description: 'Double-Triple Trailer', value: false},
                    {key: 'N', description: 'Tank Vehicle', value: false},
                    {key: 'M', description: 'Motorcycle', value: false}
                ];

                vm.getEndorsementName = function (key) {
                    var name = _.find(vm.endorsementBase, {key: key});

                    return !_.isEmpty(name) ? name.description : key;
                };
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('license')
        .directive('osetListEndorsements', EndorsementDisplayDirective);

})();
