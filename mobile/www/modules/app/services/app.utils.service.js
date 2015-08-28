(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('utilsService', utilsService);

    utilsService.$inject = ['$interval'];

    function utilsService($interval) {
        var clock = null;

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

        /**
         * @desc start interval
         * */
        function startClock(fn, time){
            if(clock === null){
                clock = $interval(fn, time);
            }
        }

        /**
         * @desc stop interval
         * */
        function stopClock(){
            if(clock !== null){
                $interval.cancel(clock);
                clock = null;
            }
        }

        return {
            serialize : serialize,
            startClock : startClock,
            stopClock : stopClock
        };
    };
})();
