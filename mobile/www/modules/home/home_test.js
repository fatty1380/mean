'use strict';

describe('homeCtrl', function(){
    var scope;

    beforeEach(angular.mock.module('home'));

    beforeEach(angular.mock.inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        console.log(scope);
         $controller('homeCtrl', {$scope: scope});

    }));
    // tests start here
    it('should have variable text = "Hello World!"', function(){
        expect(scope).toBe('Hello World!');
    });
});

