(function () {
    'use strict';

    function capFilter() {
        return function (input, all) {
            if(_.isString(input)) {
                return (!!input) ? /^[A-Z]+$/.test(input) ? input :
                    input.replace(/_/g, ' ').replace(/[a-z][A-Z]/g, function (txt) {
                        return txt.charAt(0) + ' ' + txt.charAt(1);
                    })
                        .replace(/([^\W_]+[^\s-]*) */g, function (txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        })
                    : '';
            }
            return input;
        };
    }

    angular.module('core')
        .filter('prettyPrint', prettyPrint);
    function prettyPrint() {
        return function (input) {
            return (!!input) ? JSON.stringify(input, undefined, 2) : '';
        };
    }

    function isoDateFilter() {
        return function (input, parseFmt) {
            var format = parseFmt || 'YYYYMMDD';
            return (!!input) ? moment(input, format).format('L') : '';
        };
    }

    function sanitizeFilter($sce) {
        return function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    }

    function streamlineFilter($sce) {
        return function (htmlCode) {
            var hRegex = /<(\/?)h\d>/;
            var eRegex = /<[^\/]+?><\/.+?>|<br[\/]?>/;
            var pRegex = /<(p).*?>([^<]*)<\/(p)>|<(ul|li).*?>([^<][^u]?[^l][^i]?)+<\/(ul|li)>/;

            var result = htmlCode.replace(eRegex, '');

            while (result.match(eRegex)) {
                //console.log('Replacing Empty %o', result.match(eRegex));
                result = result.replace(eRegex, '');
            }
            while (result.match(hRegex)) {
                //console.log('Replacing Headers %o', result.match(hRegex));
                result = result.replace(hRegex, '<$1b>');
            }
            while (result.match(pRegex)) {
                //console.log('Replacing <p>s %o', result.match(pRegex));
                result = result.replace(pRegex, '&nbsp;$2');
            }
            return $sce.trustAsHtml(result);
        };
    }

    function pastDaysFilter() {
        return function (items, field, days) {
            if (!days) {
                return items.filter(function () {
                    return true;
                });
            }

            var timeStart = moment().subtract(days, 'days');
            console.log('filtering back %s days to %s', days, timeStart.format('L'));
            return items.filter(function (item) {
                return (moment(item[field]).isAfter(timeStart));
            });
        };
    }

    function dollarStringFilter() {
        return function(input) {
            var base = Number(input);
            var next = base.toFixed(2);
            return '$' + next;
        };
    }

    sanitizeFilter.$inject = ['$sce'];
    streamlineFilter.$inject = ['$sce'];

    angular.module('core')
        .filter('titleCase', capFilter)
        .filter('isoDatePrint', isoDateFilter)
        .filter('sanitize', sanitizeFilter)
        .filter('streamline', streamlineFilter)
        .filter('withinPastDays', pastDaysFilter)
        .filter('toDollarString', dollarStringFilter);
})();
