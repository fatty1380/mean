(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxEditCtrl', LockboxEditCtrl);

    LockboxEditCtrl.$inject = ['$scope', '$ionicPopup', 'lockboxDocuments'];

    function LockboxEditCtrl($scope, $ionicPopup, lockboxDocuments) {
        var vm = this;

        init();

        if(!vm.documents) return;

        function init() {
            vm.documents = [];
            vm.unselectedDocuments = null;
            vm.deleteDisabled = true;
            vm.renameDisabled = true;

            getDocs();
        }

        function getDocs () {
            lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);

                    vm.documents = response.data instanceof Array && response.data.length ? response.data : lockboxDocuments.getStubDocuments();

                    for(var i = 0; i < vm.documents.length; i++){
                        vm.documents[i].checked = false;
                    }
                })
        }

        vm.cancel = function () {
            $scope.closeModal();
        };

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

        vm.rename = function (selectedIndex) {
            vm.index = selectedIndex;

            if (vm.index === null || vm.index === undefined) {
                vm.documents.filter(function (object, index) {
                    if (object.checked) {
                        index = index;
                    }
                    return object.checked;
                });
            }
            
            vm.name = vm.documents[vm.index].name;

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
                if(res) {
                    vm.documents[vm.index].name = res;
                }
                
                vm.index = null;
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

})();
