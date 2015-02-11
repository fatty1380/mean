(function () {
    'use strict';

    function HomeController($scope, $location, $timeout, $anchorScroll, $document, $log, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.showMain = true;
        $scope.showInfo = false;
        $scope.showSignup = false;

        $scope.text = {
            leader: {
                lead1: {
                    header: 'Transportation Focused',
                    text: 'The hiring website designed specifically for the Transportation Industry. Driver and Employer information is consolidated all in one place.'
                },
                lead2: {
                    header: 'A Place for Drivers',
                    text: 'Manage your reputation and driving career with hosted credentials and government reports on your resume based profile.'
                },
                lead3: {
                    header: 'An Employer\'s Hiring Hub',
                    text: 'Increase the certainty in your hiring process with higher quality and motivated individuals, with access to driver information as soon as you connect.'
                }
            },
            section1: {
                header: 'Transportation Focused',
                sub: 'A hiring website designed ideally for the Transportation industry.',
                text: '<ul><li>Job Posts, Applicant Tools & Driver Profiles designed specifically for the Industry</li>' +
                '<li>Pairing Qualified Drivers with Top Driving Jobs</li>' +
                '<li>Cutting the time it takes to hire: <ul><li>Providing MVR’s, Background Checks & Drug Tests with applications</li></ul></li></ul>'
            },
            section2: {
                header: 'Drivers: Apply for Jobs & Manage Career',
                sub: '',
                text: '<ul><li>Apply to Jobs with ‘One Click’ with your Driver Profile</li>' +
                '<li>Manage your Reputation & First Impression with Employers with your Driver Page</li>' +
                '<li>Show Employers you are Professional & Trustworthy <ul><li>Include a Background Check, MVR & Drug Test on your page</li></ul></li>' +
                '</ul>'
            },
            section3: {
                header: 'Employers: Cut Hiring Time',
                sub: '',
                text: '<ul><li>Post Jobs to a large pool of Drivers</li>' +
                '<li>Manage all of your hiring in one place <ul><li>Using Outset’s Applicant Tracking System</li></ul></li>' +
                '<li>View Higher Quality Applicants<ul><li>With Background Checks, MVR’s and more in their application</li><li>Know more before you decide to interview</li></ul></li>' +
                '<li>Don’t waste time on bad applicants<ul><li>Choose who you communicate with</li></ul></li></ul>'
            }

        };

        $scope.gotoSignup = function () {
            $scope.showMain = false;
            $scope.showInfo = false;
            $scope.showSignup = true;

            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('signup_type');

            // call $anchorScroll()
            $anchorScroll();
        };

        if ($location.hash()) {
            var element = angular.element(document.getElementById($location.hash()));

            $timeout(function () {
                $document.scrollToElementAnimated(element);
            }, 100);

        }
    }

    HomeController.$inject = ['$scope', '$location', '$timeout', '$anchorScroll', '$document', '$log', 'Authentication'];

    angular
        .module('core')
        .controller('HomeController', HomeController);
})();
