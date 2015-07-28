(function() {
    'use strict';

    function LockboxEditCtrl($scope, $ionicPopup) {
        var vm = this;

        vm.documents = [
            {
                name: 'Document',
                date: '3/17/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/13/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/12/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/11/2015',
                checked: false
            }
        ];

        vm.unselectedDocuments = null;
        vm.deleteDisabled = true;
        vm.renameDisabled = true;

        $scope.$watch(function () {
            return vm.documents.filter(vm.getUnselectedItems).length;
        }, function (currentUnselectedLength) {
            var totalLength = vm.documents.length;
            vm.deleteDisabled = (currentUnselectedLength === totalLength);
            vm.renameDisabled = (totalLength - currentUnselectedLength !== 1);
        });

        vm.getUnselectedItems = function (object) {
            if(!object || !object.hasOwnProperty('checked')) return;
            return !object.checked;
        };

        vm.rename = function () {
            vm.index = null;
            vm.name = '';

            vm.documents.filter(function (object, index) {
                if(object.checked) vm.index = index;
                return object.checked;
            });

            var renamePopup = $ionicPopup.show({
                template: '<input type="text" class="rename-popup" ng-model="vm.name">',
                title: 'Rename Selected Document',
                subTitle: 'Please, enter new document name in the field below:',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        type: 'button-small'
                    },
                    {
                        text: '<b>Save</b>',
                        type: 'button-small button-positive',
                        onTap: function(e) {
                            if (!vm.name) {
                                e.preventDefault();
                            } else {
                                return vm.name;
                            }
                        }
                    }
                ]
            });

            renamePopup.then(function(res) {
                if(res) vm.documents[vm.index].name = res;
            });
        };

        vm.showConfirm = function() {
            vm.unselectedDocuments = vm.documents.filter(vm.getUnselectedItems);
            if(vm.unselectedDocuments.length !== vm.documents.length){
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete Items',
                    cancelType: 'button-small',
                    okType: 'button-small button-assertive',
                    template: 'Are you sure you want to delete selected documents?'
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        vm.documents = vm.unselectedDocuments;
                    }
                });
            }
        };
    }

    LockboxEditCtrl.$inject = ['$scope', '$ionicPopup'];

    angular
        .module('account')
        .controller('LockboxEditCtrl', LockboxEditCtrl);

})();
