(function() {
    'use strict';

    // Companies controller
    function CompaniesController($scope, $stateParams, $location, Authentication, Companies) {
        $scope.authentication = Authentication;

        // REGION : Page Action methods

        $scope.makeCall = function() {
            window.location.href = 'tel://' + $scope.company.phone;
        };

        $scope.sendEmail = function() {
            window.location.href = 'mailto:' + $scope.company.email + '?subject=Your Outset Company Profile' + '&body=Hello ' + $scope.company.name + ',%0D%0AI saw your company profile on Outset and wanted to hear more.%0D%0A%0D%0AThank you,%0D%0A' + Authentication.user.firstName + '%0D%0A%0D%0A-------------%0D%0AView this Outset Profile here: ' + $location.$$absUrl;
        };

        $scope.openChat = function() {
            alert('Sorry, but chat functionailty is not available at this time');
        };

        // REGION : CRUD Methods

        // Create new Company
        $scope.create = function() {
            // Create new Company object
            var company = new Companies.ById({
                name: this.name,
                about: this.about,
                phone: this.phone,
                email: this.email,
                zip: this.zip
            });

            // Redirect after save
            company.$save(function(response) {
                $location.path('companies/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Company
        $scope.remove = function(company) {
            if (company) {
                company.$remove();

                for (var i in $scope.companies) {
                    if ($scope.companies[i] === company) {
                        $scope.companies.splice(i, 1);
                    }
                }
            } else {
                $scope.company.$remove(function() {
                    $location.path('companies');
                });
            }
        };

        // Update existing Company
        $scope.update = function() {
            var company = $scope.company;

            company.$update(function() {
                $location.path('companies/' + company._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Companies
        $scope.find = function() {
            $scope.companies = Companies.ById.query();
        };

        $scope.init = function() {
            if ($stateParams.companyId === 'me') {
                $scope.findByUser($scope.authentication.user);
            } else {
                $scope.findOne();
            }
        };

        // Find existing Company
        $scope.findOne = function() {
            $scope.company = Companies.ById.get({
                companyId: $stateParams.companyId
            });
        };

        $scope.findByUser = function(user) {
            if (user.type === 'owner') {
                $scope.company = Companies.ByUser.get({
                    userId: user._id
                });
            }
        };
    }

    CompaniesController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Companies'];

    angular.module('companies').controller('CompaniesController', CompaniesController);
})();
