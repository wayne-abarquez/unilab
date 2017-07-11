(function(){
'use strict';

angular.module('demoApp.admin')
    .controller('adminPanelController', ['$rootScope', '$scope', 'boundariesService', 'branchService', 'userTerritoriesService', '$timeout', 'gmapServices', '$q', 'alertServices', 'placesService', '$mdSidenav', adminPanelController]);

    function adminPanelController ($rootScope, $scope, boundariesService, branchService, userTerritoriesService, $timeout, gmapServices, $q, alertServices, placesService, $mdSidenav) {
        var vm = this;

        var polygonObj;

        var selectedTypes = [],
            foundTypeIndex,
            isSelected;

        var promises = [];
        var aborts = {};

        vm.boundaries = [];
        vm.territories = [];
        vm.showTerritoriesPanel = false;

        vm.expandCallback = expandCallback;
        vm.showBoundary = showBoundary;
        vm.showTerritory = showTerritory;
        vm.toggleType = toggleType;

        initialize();

        function initialize () {
            boundariesService.loadBoundaries()
                .then(function (list) {
                    vm.boundaries = angular.copy(list);
                }, function (error) {
                    console.log('failed to load: ', error);
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

            vm.placeTypes = _.groupBy(rawTypes, function (item, index) {
                return index % 2;
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

            $scope.$watch(function(){
                return vm.loadPois;
            }, function(newValue, oldValue){
                if (newValue === oldValue) return;

                if (newValue) {
                    placesService.showVisiblePOIs();
                    return;
                }

                placesService.hidePOIs();
            });
        }

        function showPolygon(latLngArray, isTerritory) {
            if (!latLngArray.length) {
                alertServices.showError('Cannot load polygon, data error.');
                return;
            }

            var color = isTerritory ? '#3f51b5' : '#ff0000';

            if (polygonObj) {
                polygonObj.setPath(latLngArray);
                polygonObj.setOptions({
                    fillColor: color,
                    strokeColor: color,
                });
            } else {
                polygonObj = gmapServices.createPolygon(latLngArray, color);
            }
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

        function showBoundary(boundary, isParent) {
            var item = boundariesService.getRestangularObj(boundary.id);

            for (var k in aborts) {
                if (aborts[k]) aborts[k].resolve();
            }

            aborts = {
                detail: $q.defer(),
                branches: $q.defer()
            };

            if (boundary.typeid == 6) {
                $('v-pane#' + boundary.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'block'});
            } else {
                $('md-list-item#' + item.id.toString() + ' md-progress-circular').show();
            }

            branchService.hideMarkers();
            placesService.hidePOIs();

            promises.push(
                item.withHttpConfig({timeout: aborts.detail.promise})
                    .get()
                    .then(function (response) {
                        var resp = response.plain();

                        showPolygon(resp.geometry);
                        gmapServices.setZoomIfGreater(12);
                        gmapServices.panToPolygon(polygonObj);
                    })
            );

            // load branches
            promises.push(
                item.withHttpConfig({timeout: aborts.branches.promise})
                    .getList('branches')
                    .then(function (response) {
                        var resp = response.plain();

                        if (!resp.length) {
                            alertServices.showBottomLeftToast(boundary.name.capitalize() + ' doesnt have branch yet.');
                            return;
                        }

                        branchService.loadMarkers(resp.map(function (item) {
                            return item.branch;
                        }));
                    })
                    .finally(function () {
                        $timeout(function () {
                            if (boundary.typeid == 6) $('v-pane#' + boundary.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'none'});
                            else $('md-list-item#' + item.id.toString() + ' md-progress-circular').hide();
                        }, 500);
                    })
            );

            // load places
            if (vm.loadPois && !isParent) {
                promises.push(
                    placesService.loadPOIsWithinBoundary(boundary.id, selectedTypes)
                        .then(function (response) {
                            placesService.showPOIs(response);
                        })
                );
            }

            //$q.all(promises)
            //    .finally(function(){
            //        $timeout(function () {
            //            if (boundary.typeid == 6) $('v-pane#' + boundary.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'none'});
            //            else $('md-list-item#' + item.id.toString() + ' md-progress-circular').hide();
            //        }, 500);
            //    });
        }

        function expandCallback(item, event) {
            event.stopPropagation();

            if (item.isExpanded === false) return;

            if (item.typeid < 7) {
                if (item.hasOwnProperty('children') && item.children.length) return;

                $('v-pane#' + item.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'block'});

                item.children = [];

                $('v-pane#' + item.id.toString() + ' v-pane-content v-accordion').children().html('');

                boundariesService.loadBoundaries(item.id)
                    .then(function (list) {
                        if (list.length) item.children = angular.copy(list);
                    }, function (error) { console.log('failed to load: ', error); })
                    .finally(function () {
                        if (item.typeid == 6) {
                            showBoundary(item, true);
                        } else {
                            $('v-pane#' + item.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'none'});
                        }
                    });

                return;
            }

            showBoundary(item);

            return;
        }

        function showTerritory (item) {
            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').show();

            branchService.hideMarkers();
            placesService.hidePOIs();

            $rootScope.selectedTerritory = item;

            showPolygon(item.territory.geom, true);
            gmapServices.setZoomIfGreater(10);
            gmapServices.panToPolygon(polygonObj);

            var promises = [];

            // load places
            if (vm.loadPois) {
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

                        if (!response.length) {
                            alertServices.showBottomLeftToast('This territory doesnt have branch yet.');
                        } else {
                            $rootScope.selectedTerritory.branches = response;
                            branchService.loadMarkers(response);
                        }

                        $timeout(function () {
                            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').hide();
                        }, 500);

                        $mdSidenav('territoryInfoPanelSidenav').open();
                        $rootScope.$broadcast('territory_selected', $rootScope.selectedTerritory);
                    })
            );
        }

    }
}());