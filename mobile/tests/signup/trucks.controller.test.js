'use strict';

(function() {
    // Profile Controller Spec
    describe('trucksCtrl', function() {
        // Initialize global variables
        var trucksCtrl,
            httpBackend;

        // Then we can start by loading the main application module
        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            // Set up the mock http service responses
            var $controller = $injector.get('$controller');
            httpBackend = $injector.get('$httpBackend');
        }));

        // use scope
        beforeEach(inject(function($rootScope, $controller){
            var mock = [
                {name:'Peterbilt1', logoClass:'peterbilt-logo', checked:false},
                {name:'International1', logoClass:'international-logo', checked:false},
                {name:'Freightliner1', logoClass:'freightliner-logo', checked:false},
                {name:'Mack Trucks1', logoClass:'mack-logo', checked:false},
                {name:'Kenworth1', logoClass:'kenworth-logo', checked:false},
                {name:'Volvo1', logoClass:'volvo-logo', checked:false}
            ]
           var  scope = $rootScope.$new();
            trucksCtrl = $controller('trucksCtrl', {
                $scope: scope
              //  trucks: mock
            });
        }));

      /*
       use vm
       beforeEach(inject(function($controller){
            var mock = [
                {name:'Peterbilt1', logoClass:'peterbilt-logo', checked:false},
                {name:'International1', logoClass:'international-logo', checked:false},
                {name:'Freightliner1', logoClass:'freightliner-logo', checked:false},
                {name:'Mack Trucks1', logoClass:'mack-logo', checked:false},
                {name:'Kenworth1', logoClass:'kenworth-logo', checked:false},
                {name:'Volvo1', logoClass:'volvo-logo', checked:false}
            ]
            var mmm = $controller('trucksCtrl', {
                trucks: mock
            });

            console.log(mmm);
        }));*/

        it('has a couple of trucks', function() {
            expect(trucksCtrl.trucks.length).toBeDefined();
        });

    });
}());
