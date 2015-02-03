(function () {
    'use strict';

    var template = '<span><span ng-repeat="(name, val) in vm.endorsements" ' +
        'ng-init="description = vm.getEndorsementName(name)" ' +
        'ng-if="val"' +
        'class="endorsement label label-success" ' +
        'tooltip-popup-delay="750" ' +
        'tooltip="{{description}}">{{name}}&nbsp;</span>' +
        '<span ng-if="vm.filteredEndorsements.length===0">None</span></span>';

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

                    return name.description;
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
