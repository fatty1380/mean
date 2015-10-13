(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxEditCtrl', LockboxEditCtrl);

    LockboxEditCtrl.$inject = ['$scope', '$ionicPopup', 'lockboxDocuments', 'parameters'];

    function LockboxEditCtrl($scope, $ionicPopup, lockboxDocuments, parameters) {
        var vm = this;

        vm.cancel = cancel;
        vm.getUnselectedItems = getUnselectedItems;
        vm.rename = rename;
        vm.documents = parameters.documents;
        vm.deleteDocuments = deleteDocuments;

        init();

        if (!vm.documents) return;

        function init() {
            vm.unselectedDocuments = null;
            vm.deleteDisabled = true;
            vm.renameDisabled = true;

            //getDocs();
        }

        function getDocs() {
            lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    vm.documents = response instanceof Array && response.length ? response : [];

                    for (var i = 0; i < vm.documents.length; i++) {
                        vm.documents[i].checked = false;
                    }
                });
        }

        function cancel() {
            $scope.closeModal();
        }

        $scope.$watch(function () {
            return vm.documents.filter(vm.getUnselectedItems).length;
        }, function (currentUnselectedLength) {
            var totalLength = vm.documents.length;
            vm.deleteDisabled = (currentUnselectedLength === totalLength);
            vm.renameDisabled = (totalLength - currentUnselectedLength !== 1);
        });

        function getUnselectedItems(object) {
            if (!object || !object.hasOwnProperty('checked')) return false;
            return !object.checked;
        }

        function getSelected(object) {
            if (!object || !object.hasOwnProperty('checked')) return false;
            return object.checked;
        }

        function rename(selectedIndex) {
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
                        onTap: function (e) {
                            if (!vm.name) {
                                e.preventDefault();
                            } else {
                                return vm.name;
                            }
                        }
                    }
                ]
            });

            renamePopup.then(function (res) {
                if (res) {

                    lockboxDocuments.updateDocument(vm.documents[vm.index], { name: res })
                        .then(function (result) {
                            console.log('updated document to: ', result);

                            vm.index = null;
                        })
                        .catch(function failure(err) {
                            console.error('Problem updating document: ', err);
                        })
                }
            });
        }

        function deleteDocuments() {
            vm.unselectedDocuments = vm.documents.filter(vm.getUnselectedItems);
            if (vm.unselectedDocuments.length !== vm.documents.length) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete Items',
                    cancelType: 'button-small',
                    okType: 'button-small button-assertive',
                    template: 'Are you sure you want to delete selected documents?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        lockboxDocuments.removeDocuments(vm.documents.filter(getSelected));
                        
                        //vm.documents = vm.unselectedDocuments;
                    }
                });
            }
        }
    }
})();
