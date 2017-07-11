(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('salesPanelController', ['$q', '$scope', '$rootScope', 'userTerritoriesService', 'gmapServices', 'branchService', '$mdSidenav', 'placesService', '$timeout', 'alertServices', salesPanelController]);

    function salesPanelController ($q, $scope, $rootScope, userTerritoriesService, gmapServices, branchService, $mdSidenav, placesService, $timeout, alertServices) {
        var vm = this;

        var polygonTerritory;

        var foundTypeIndex,
            isSelected;

        var selectedTypes = [];

        vm.territories = [];

        vm.filter = {
            q: ''
        };

        vm.toggleToolbarPanel = toggleToolbarPanel;
        vm.showTerritoryDetails = showTerritoryDetails;
        vm.toggleType = toggleType;

        initialize();

        function initialize () {
            $rootScope.$watch('currentUser', function (newValue) {
                if (!newValue) return;

                userTerritoriesService.getTerritories()
                    .then(function (territories) {
                        vm.territories = angular.copy(territories);
                    });
            });

            var rawTypes = placesService.getPlaceTypes().map(function (type) {
                foundTypeIndex = placesService.defaultPlaceTypes.indexOf(type);
                isSelected = false;

                // initially select default place type
                if (foundTypeIndex !== -1) {
                    selectedTypes.push(type);
                    isSelected = true;
                }

                return {
                    name: type,
                    model: isSelected
                }
            });

            vm.placeTypes = _.groupBy(rawTypes, function(item, index){
               return index % 2;
            });

            $scope.$watch(function () {
                return vm.loadPois;
            }, function (newValue, oldValue) {
                if (newValue === oldValue) return;

                if (newValue) {
                    placesService.showVisiblePOIs();
                    return;
                }

                placesService.hidePOIs();
            });
        }

        function toggleToolbarPanel () {
            vm.filter.q = '';
            vm.showFilterPanel = !vm.showFilterPanel;
        }

        function showPolygonTerritory(latLngArray) {
            if (!latLngArray.length) {
                alertServices.showError('Cannot load polygon, data error.');
                return;
            }

            if (polygonTerritory) {
                polygonTerritory.setPath(latLngArray);
                return;
            }

            polygonTerritory = gmapServices.createPolygon(latLngArray, '#3f51b5');
            polygonTerritory.setVisible(false);
        }

        function toggleType(type) {
            var arr = vm.placeTypes['0'].concat(vm.placeTypes['1']);
            var val = _.findWhere(arr, {name: type});

            var index = selectedTypes.indexOf(val.name);

            if (val.model && index === -1) {
                selectedTypes.push(val.name)
            } else if (index !== -1) {
                selectedTypes.splice(index, 1);
            }
        }

        function showTerritoryDetails (item) {
            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').show();

            $rootScope.selectedTerritory = item;

            branchService.hideMarkers();
            placesService.hidePOIs();

            showPolygonTerritory(item.territory.geom);

            gmapServices.setZoomIfGreater(12);
            gmapServices.panToPolygon(polygonTerritory);

            var promises = [];

            // load places
            if (vm.loadPois) {
                console.log('selected place types: ', selectedTypes);
                promises.push(
                    placesService.loadPOIs(item.territoryid, selectedTypes)
                        .then(function (response) {
                            placesService.showPOIs(response);
                            $rootScope.selectedTerritory.places = response;
                        })
                );
            }

            promises.push(
                userTerritoriesService.getTerritoryBranches(item.territoryid)
                    .then(function (response) {
                        $rootScope.selectedTerritory.branches = response;

                        if (!response.length) {
                            alertServices.showBottomLeftToast('This territory doesnt have branch yet.');
                        } else {
                            branchService.loadMarkers(response);
                        }

                        $timeout(function () {
                            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').hide();
                        }, 500);

                        $mdSidenav('territoryInfoPanelSidenav').open();
                        $rootScope.$broadcast('territory_selected', $rootScope.selectedTerritory);
                    })
            );

            //$q.all([promises])
            //    .finally(function(){
            //        $timeout(function () {
            //            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').hide();
            //        }, 1000);
            //    });
        }


    }
}());