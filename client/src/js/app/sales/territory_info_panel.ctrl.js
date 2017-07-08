(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('territoryInfoPanelController', ['$rootScope', 'branchService', 'placesService', '$mdSidenav', territoryInfoPanelController]);

    function territoryInfoPanelController ($rootScope, branchService, placesService, $mdSidenav) {
        var vm = this;

        vm.showPOIByType = showPOIByType;
        vm.toggleBranches = toggleBranches;
        vm.close = close;

        initialize();

        function initialize () {
            $rootScope.$on('territory_selected', function (e, data) {
                vm.territory = angular.copy(data);

                console.log('territory selected: ',vm.territory);

                var allPlaces = [];
                for (var k in vm.territory.places) {
                    vm.territory.places[k].forEach(function (item) {
                        allPlaces.push(item);
                    });
                }
                vm.territory.places['all'] = allPlaces;
            });
        }

        function showPOIByType (type) {
            placesService.showPOIByType(type);
        }

        function toggleBranches () {
            branchService.toggleMarkers();
        }

        function close () {
            //$rootScope.showGRDPPanel = false;

            $mdSidenav('territoryInfoPanelSidenav')
                .close()
                .then(function () {
                    $rootScope.showTerritoryDetailBtn = true;
                });
        }

    }
}());