(function(){
'use strict';

angular.module('demoApp.admin')
    .controller('adminPanelController', ['$rootScope', 'boundariesService', 'branchService', 'userTerritoriesService', '$timeout', 'gmapServices', '$q', 'alertServices', adminPanelController]);

    function adminPanelController ($rootScope, boundariesService, branchService, userTerritoriesService, $timeout, gmapServices, $q, alertServices) {
        var vm = this;

        var polygonObj;

        vm.boundaries = [];
        vm.territories = [];
        vm.showTerritoriesPanel = false;

        vm.expandCallback = expandCallback;
        vm.showBoundary = showBoundary;
        vm.showTerritory = showTerritory;

        initialize();

        function initialize () {
            boundariesService.loadBoundaries()
                .then(function (list) {
                    vm.boundaries = angular.copy(list);
                }, function (error) {
                    console.log('failed to load: ', error);
                });

            $rootScope.$watch('currentUser', function (newValue, oldValue) {
                if (!newValue) return;

                userTerritoriesService.getTerritories()
                    .then(function (territories) {
                        vm.territories = _.uniq(territories, true, function (item) {
                            return item.territoryid;
                        });
                    });
            });
        }

        function showPolygon(latLngArray, isTerritory) {
            if (polygonObj) {
                polygonObj.setPath(latLngArray);
            } else {
                polygonObj = gmapServices.createPolygon(latLngArray);
            }

            var color = isTerritory ? '#3f51b5' : '#ff0000';

            polygonObj.setOptions({
                fillColor: color,
                strokeColor: color
            });
        }

        function showBoundary(brgy) {
            var item = boundariesService.getRestangularObj(brgy.id);

            $('md-list-item#' + item.id.toString() + ' md-progress-circular').show();

            var boundaryDataResponse,
                boundaryBranchesResponse;

            var dfd1 = item.get()
                .then(function (response) {
                    boundaryDataResponse = response.plain();
                    //console.log('get boundary detail: ', boundaryDataResponse);
                });

            var dfd2 = item.getList('branches')
                    .then(function(response){
                        boundaryBranchesResponse = response.plain();
                        //console.log('get branches within boundary: ', boundaryBranchesResponse);
                    });


            $q.all([dfd1, dfd2])
                .then(function(){
                    showPolygon(boundaryDataResponse.geometry);
                    gmapServices.setZoomIfGreater(14);
                    gmapServices.panToPolygon(polygonObj);

                    branchService.loadMarkers(boundaryBranchesResponse.map(function(item){ return item.branch; }));
                })
                .finally(function () {

                    $timeout(function () {
                        $('md-list-item#' + item.id.toString() + ' md-progress-circular').hide();
                    }, 1000);

                    // show pois on map
                    //boundariesService.showPOIs(response.places, item);
                    //boundariesService.loadDPs(response.facilities);
                    //$mdSidenav('boundariesInfoSidenav').open();
                });
        }

        function expandCallback(item, event) {
            event.stopPropagation();

            if (item.isExpanded === false) return;

            if (item.typeid < 7) {
                if (item.hasOwnProperty('children') && item.children.length) return;

                $('v-pane#' + item.id.toString() + ' v-pane-header md-progress-circular').show();

                item.children = [];

                $('v-pane#' + item.id.toString() + ' v-pane-content v-accordion').children().html('');

                boundariesService.loadBoundaries(item.id)
                    .then(function (list) {
                        if (list.length) item.children = angular.copy(list);
                    }, function (error) {
                        console.log('failed to load: ', error);
                    })
                    .finally(function () {
                        $timeout(function () {
                            $('v-pane#' + item.id.toString() + ' v-pane-header md-progress-circular').hide();
                        }, 1000);
                    });

                return;
            }

            showBoundary(item);

            return;
        }

        function showTerritory (item) {
            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').show();

            console.log('showTerritory: ',item);
            //$rootScope.selectedTerritory = item;


            // load places
            // TODO: uncomment this after working on other features to avoid gmap credits toll
            //var dfd1 = placesService.loadPOIs(item.territoryid)
            //            .then(function(response){
            //                placesService.showPOIs(response);
            //                $rootScope.selectedTerritory.places = response;
            //            });

            var dfd2 = userTerritoriesService.getTerritoryBranches(item.territoryid)
                .then(function (response) {
                    console.log('getTerritoryBranches: ', response);

                    if (!response.length) {
                        alertServices.showBottomLeftToast('This territory doesnt have branch yet.');
                        return;
                    }

                    branchService.loadMarkers(response);
                });

            $q.all([dfd2])
                .then(function () {
            //        $mdSidenav('territoryInfoPanelSidenav').open();
            //        $rootScope.$broadcast('territory_selected', $rootScope.selectedTerritory);
                })
                .finally(function(){
                    showPolygon(item.territory.geom, true);
                    gmapServices.setZoomIfGreater(10);
                    gmapServices.panToPolygon(polygonObj);

                    $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').hide();
                });
        }

    }
}());