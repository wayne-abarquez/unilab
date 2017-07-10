(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('salesPageController', ['gmapServices', '$rootScope', '$mdSidenav', salesPageController]);

    function salesPageController (gmapServices, $rootScope, $mdSidenav) {
        var vm = this;

        vm.showTerritoryPanelDetail = showTerritoryPanelDetail;

        initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');
        }

        function showTerritoryPanelDetail () {
            $mdSidenav('territoryInfoPanelSidenav')
                .open()
                .then(function () {
                    $rootScope.showTerritoryDetailBtn = false;
                    $rootScope.showGRDPPanel = true;
                });
        }

    }
}());