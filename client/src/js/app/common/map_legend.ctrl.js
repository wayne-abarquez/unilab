(function(){
'use strict';

angular.module('demoApp')
    .controller('mapLegendController', ['$rootScope', mapLegendController]);

    function mapLegendController ($rootScope) {
        var vm = this;

        vm.legendData = {};
        vm.close = close;

        initialize();

        function initialize () {
            $rootScope.$on('compile-map-legend', function (e, params) {
                vm.legendData[params.type] = params.data;

                if (!$rootScope.showLegend) $rootScope.showLegend = true;
            });
        }

        function close () {
            $rootScope.showLegend = false;
        }

    }
}());