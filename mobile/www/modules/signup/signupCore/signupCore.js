angular
    .module('signupCore', [])

    .controller('signupCtrl', function ($scope, $location) {
        var vm = this;

        var user = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        };

        $scope.register = function(){
            console.log('register');
            clearForm();
        }

        var clearForm = function () {
            console.log('clearForm');
            $location.path("signup/engagement");
        };



})
angular.module('directives', [])
    .directive("compareTo", function(){
        console.log("!!!dsfsdf");
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function(scope, element, attributes, ngModel) {
                console.log("sdfsdf");
                ngModel.$validators.compareTo = function(modelValue) {
                    console.log("!!");
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    });


