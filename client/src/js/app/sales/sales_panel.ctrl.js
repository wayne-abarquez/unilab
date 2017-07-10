(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('salesPanelController', ['$q', '$rootScope', '$timeout', 'userTerritoriesService', 'gmapServices', 'branchService', '$mdSidenav', 'placesService', salesPanelController]);

    function salesPanelController ($q, $rootScope, $timeout, userTerritoriesService, gmapServices, branchService, $mdSidenav, placesService) {
        var vm = this;

        var polygonTerritory;

        vm.territories = [];

        vm.filter = {
            q: ''
        };

        vm.toggleToolbarPanel = toggleToolbarPanel;
        vm.showTerritoryDetails = showTerritoryDetails;

        initialize();

        function initialize () {
            $rootScope.$watch('currentUser', function (newValue, oldValue) {
                if (!newValue) return;

                userTerritoriesService.getTerritories()
                    .then(function (territories) {
                        vm.territories = angular.copy(territories);
                    });
            });
        }

        function toggleToolbarPanel () {
            vm.filter.q = '';
            vm.showFilterPanel = !vm.showFilterPanel;
        }

        function showPolygonTerritory(latLngArray) {
            if (polygonTerritory) {
                polygonTerritory.setPath(latLngArray);
                return;
            }
            polygonTerritory = gmapServices.createPolygon(latLngArray, '#3f51b5');
        }

        function showTerritoryDetails (item) {
            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').show();

            $rootScope.selectedTerritory = item;

            showPolygonTerritory(item.territory.geom);

            gmapServices.setZoomIfGreater(12);
            gmapServices.panToPolygon(polygonTerritory);

            // load places
            // TODO: uncomment this after working on other features to avoid gmap credits toll
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
                })
                .finally(function(){
                    $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').hide();
                });


        }


    }
}());