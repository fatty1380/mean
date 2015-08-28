(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('utilsService', utilsService);

    function utilsService() {

        /**
         * @desc returns serialized data
        * */
        function serialize( data ) {
            if ( ! angular.isObject( data ) ) {
                return( ( data == null ) ? "" : data.toString() );
            }
            var buffer = [];
            for ( var name in data ) {
                if ( ! data.hasOwnProperty( name ) ) {
                    continue;
                }
                var value = data[ name ];
                buffer.push(
                    encodeURIComponent( name ) +
                    "=" +
                    encodeURIComponent( ( value == null ) ? "" : value )
                );
            }
            var source = buffer
                    .join( "&" )
                    .replace( /%20/g, "+" )
                ;
            return( source );
        }
        return {
            serialize : serialize
        };
    };
})();
