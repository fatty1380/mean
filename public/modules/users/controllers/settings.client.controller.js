'use strict';

function SettingsController( $scope, $http, $location, Users, Authentication ) {
    $scope.activeModule = 'users';
    $scope.user = Authentication.user;

    // If user is not signed in then redirect back home
    if ( !$scope.user ) $location.path( '/' );

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function ( provider ) {
        for ( var i in $scope.user.additionalProvidersData ) {
            return true;
        }

        return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function ( provider ) {
        return $scope.user.provider === provider || ( $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[ provider ] );
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function ( provider ) {
        $scope.success = $scope.error = null;

        $http.delete( '/users/accounts', {
            params: {
                provider: provider
            }
        } )
            .success( function ( response ) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.user = Authentication.user = response;
            } )
            .error( function ( response ) {
                $scope.error = response.message;
            } );
    };

    // Update a user profile
    $scope.updateUserProfile = function () {
        $scope.success = $scope.error = null;

        // Remove License "enum" info
        // Todo: move enum info into separate request
        if ( $scope.user.licenses.length > 0 ) {
            delete $scope.user.licenses[ 0 ].enums;
        }


        var user = new Users( $scope.user );

        user.$update( function ( response ) {
            $scope.success = true;
            Authentication.user = response;
        }, function ( response ) {
            $scope.error = response.data.message;
        } );
    };

    // Change user password
    $scope.changeUserPassword = function () {
        $scope.success = $scope.error = null;

        $http.post( '/users/password', $scope.passwordDetails )
            .success( function ( response ) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            } )
            .error( function ( response ) {
                $scope.error = response.message;
            } );
    };

    $scope.signup = function () {
        $http.post( '/auth/signup', $scope.credentials )
            .success( function ( response ) {
                //If successful we assign the response to the global user model
                $scope.authentication.user = response;

                //And redirect to the index page
                $location.path( '/' );
            } )
            .error( function ( response ) {
                $scope.error = response.message;
            } );
    };

    // Specific User Type Stuff
    $scope.addLicense = function () {

        $scope.success = $scope.error = null;
        event.preventDefault();

        $http.get( '/users/newLicense', $scope.licenses )
            .success( function ( response ) {
                $scope.user.licenses.push( response );
            } )
            .error( function ( response ) {
                alert( 'Failed with response: ' + response.message );

                var data = {
                    type: 'pscope',
                    number: 'pscope',
                    state: 'pscope',
                    issued: new Date( '2014-07-01' ),
                    expired: new Date( '2014-07-01' ),
                    endorsements: []
                };

                $scope.user.licenses.push( {
                    info: data
                } );
            } );



    };

    $scope.switchHelper = function ( value ) {
        if ( $scope.user.licenses.length === 0 )
            return 0;
        else
            return 1;
    };
}

SettingsController.$inject = [ '$scope', '$http', '$location', 'Users', 'Authentication' ];

angular
    .module( 'users' )
    .controller( 'SettingsController', SettingsController );
