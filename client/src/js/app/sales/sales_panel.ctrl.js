(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('salesPanelController', ['$q', '$rootScope', 'userTerritoriesService', 'gmapServices', 'branchService', '$mdSidenav', 'placesService', salesPanelController]);

    function salesPanelController ($q, $rootScope, userTerritoriesService, gmapServices, branchService, $mdSidenav, placesService) {
        var vm = this;

        var polygonTerritory;

        vm.territories = [];

        vm.toggleToolbarPanel = toggleToolbarPanel;
        vm.showTerritoryDetails = showTerritoryDetails;

        initialize();

        function initialize () {
            userTerritoriesService.getTerritories()
                .then(function(territories){
                    vm.territories = angular.copy(territories);
                });
        }

        function toggleToolbarPanel () {
            vm.showFilterPanel = !vm.showFilterPanel;
        }

        function showPolygonTerritory(latLngArray) {
            if (polygonTerritory) {
                polygonTerritory.setPath(latLngArray);
                return;
            }
            polygonTerritory = gmapServices.createPolygon(latLngArray, '#ff0000');
        }

        function showTerritoryDetails (item) {
            $rootScope.selectedTerritory = item;

            showPolygonTerritory(item.territory.geom);

            gmapServices.setZoomIfGreater(12);
            gmapServices.panToPolygon(polygonTerritory);

            // load places
            var dfd1 = placesService.loadPOIs(item.territoryid)
                        .then(function(response){
                            placesService.showPOIs(response);
                            $rootScope.selectedTerritory.places = response;
                        });

            var dfd2 = userTerritoriesService.getTerritoryBranches(item.territoryid)
                .then(function (response) {
                    $rootScope.selectedTerritory.branches = response;
                    branchService.loadMarkers(response);
                });

            $q.all([dfd1, dfd2])
                .then(function(){
                    $mdSidenav('territoryInfoPanelSidenav').open();
                    $rootScope.$broadcast('territory_selected', $rootScope.selectedTerritory);
                });


        }


    }
}());