(function(){
'use strict';

angular.module('demoApp.admin')
    .controller('adminPanelController', ['$rootScope', '$scope', 'boundariesService', 'branchService', 'userTerritoriesService', '$timeout', 'gmapServices', '$q', 'alertServices', 'placesService', '$mdSidenav', 'mapToolsService', '$mdToast', adminPanelController]);

    function adminPanelController ($rootScope, $scope, boundariesService, branchService, userTerritoriesService, $timeout, gmapServices, $q, alertServices, placesService, $mdSidenav, mapToolsService, $mdToast) {
        var vm = this;

        var polygonObj,
            adminInfowindow;
        ;

        var selectedTypes = [],
            foundTypeIndex,
            isSelected;

        var promises = [];
        var aborts = {};

        var currentSelected = {
            type: '', // boundary/territory
            id: '',
            typeid: ''
        };

        vm.boundaries = [];
        vm.territories = [];
        vm.showTerritoriesPanel = false;
        vm.showPoiPanel = false;

        vm.expandCallback = expandCallback;
        vm.showBoundary = showBoundary;
        vm.showTerritory = showTerritory;
        vm.toggleType = toggleType;
        vm.uploadBranchData = uploadBranchData;
        vm.uploadSalesData = uploadSalesData;

        initialize();

        function initialize () {
            adminInfowindow = gmapServices.createInfoWindow('');

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

            $scope.$watch(function(){
                return vm.showTerritoriesPanel;
            }, function (newValue, oldValue){
                if (newValue === oldValue) return;

                if (newValue) {
                    vm.showPoiPanel = true;
                } else {
                    //vm.loadPois = false;
                    //vm.showPoiPanel = false;
                }

                clear();

                if (!newValue) $mdSidenav('territoryInfoPanelSidenav').close();
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
            //console.log('showPolygon: ',latLngArray);
            if (!latLngArray.length) {
                alertServices.showError('Cannot load polygon, data error.');
                return;
            }

            var color = isTerritory ? '#3f51b5' : '#ff0000';

            if (polygonObj) {
                polygonObj.setOptions({
                    fillColor: color,
                    strokeColor: color,
                    paths: latLngArray
                });
            } else {
                polygonObj = gmapServices.createPolygon(latLngArray, color);
            }
        }

        /*
        * Show POI by type
        */

        function toggleType(type) {
            var arr = vm.placeTypes['0'].concat(vm.placeTypes['1']);
            var val = _.findWhere(arr, {name: type});

            var index = selectedTypes.indexOf(val.name);

            if (val.model && index === -1) {
                selectedTypes.push(val.name)
            } else if (index !== -1) {
                selectedTypes.splice(index, 1);
            }

            if (!currentSelected.id || !vm.loadPois) return;

            if (currentSelected.type == 'territory' && $rootScope.selectedTerritory) {
                placesService.loadPOIs($rootScope.selectedTerritory.territoryid, selectedTypes)
                    .then(function (response) {
                        console.log('loadPOIs response',response);
                        placesService.showPOIs(response);
                        $rootScope.selectedTerritory.places = response;
                    });
            } else if (currentSelected.type == 'boundary' && currentSelected.typeid >= 6) { // show pois for city and brgy level
                placesService.loadPOIsWithinBoundary(currentSelected.id, selectedTypes)
                    .then(function (response) {
                        placesService.showPOIs(response, adminInfowindow);
                    });
            }
        }

        function showBoundary(boundary, isParent) {
            clear();

            currentSelected = {
                type: 'boundary',
                id: boundary.id,
                typeid: boundary.typeid
            };

            var item = boundariesService.getRestangularObj(boundary.id);

            for (var k in aborts) if (aborts[k]) aborts[k].resolve();

            aborts = {
                detail: $q.defer(),
                branches: $q.defer()
            };

            if (boundary.typeid == 6) {
                $('v-pane#' + boundary.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'block'});
            } else {
                $('md-list-item#' + item.id.toString() + ' md-progress-circular').show();
            }

            // show poi selection for city and barangay
            if (boundary.typeid >= 6) {
                $timeout(function () {
                    vm.showPoiPanel = true;
                    vm.loadPois = true;
                }, 500);
            }

            promises.push(
                item.withHttpConfig({timeout: aborts.detail.promise})
                    .get()
                    .then(function (response) {
                        var resp = response.plain();
                        showPolygon(resp.geometry);
                        gmapServices.fitToBoundsByPolygon(polygonObj);
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
                        }), null, adminInfowindow);
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
                            placesService.showPOIs(response, adminInfowindow);
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

        function boundaryAfterExpand(item) {
            if (item.typeid == 6) {
                showBoundary(item, true);
            } else {
                $('v-pane#' + item.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'none'});
            }
        }

        function expandCallback(item, event) {
            event.stopPropagation();

            if (item.isExpanded === false) return;

            vm.showPoiPanel = false;
            vm.loadPois = false;

            //if (item.typeid < 7) {
            if (item.typeid < 7) {
                if (item.hasOwnProperty('children') && item.children.length) {
                    boundaryAfterExpand(item);
                    return;
                }

                $('v-pane#' + item.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'block'});

                item.children = [];

                $('v-pane#' + item.id.toString() + ' v-pane-content v-accordion').children().html('');

                boundariesService.loadBoundaries(item.id)
                    .then(function (list) {
                        if (list.length) item.children = angular.copy(list);
                    }, function (error) { console.log('failed to load: ', error); })
                    .finally(function () {
                        boundaryAfterExpand(item);
                    });

                return;
            }

            showBoundary(item);

            return;
        }

        function clear () {
            $rootScope.$broadcast('clear-compare-branches');
            branchService.hideMarkers();
            placesService.hidePOIs();
            if (polygonObj) {
                polygonObj.setMap(null);
                polygonObj = null;
            }
            $mdToast.hide();
            mapToolsService.clearMeasurementLines();
        }

        function showTerritory (item) {
            clear();

            console.log('showTerritory: ',item);

            if (!vm.loadPois) vm.loadPois = true;

            currentSelected = {
                type: 'territory',
                id: 'item.id',
                typeid: ''
            };

            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').show();

            $rootScope.selectedTerritory = item;

            showPolygon(item.territory.geom, true);
            gmapServices.fitToBoundsByPolygon(polygonObj);

            var promises = [];

            // load places
            if (vm.loadPois) {
                promises.push(
                    placesService.loadPOIs(item.territoryid, selectedTypes)
                        .then(function (response) {
                            placesService.showPOIs(response, adminInfowindow);
                            $rootScope.selectedTerritory.places = response;
                        })
                );
            }

            promises.push(
                userTerritoriesService.getTerritoryBranches(item.territoryid)
                    .then(function (response) {
                        //console.log('territory branches: ',response);
                        if (!response.length) {
                            alertServices.showBottomLeftToast('This territory doesnt have branch yet.');
                        } else {
                            $rootScope.selectedTerritory.branches = response;
                            branchService.loadMarkers(response, null, adminInfowindow);
                        }

                        $timeout(function () {
                            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').hide();
                        }, 500);

                        $mdSidenav('territoryInfoPanelSidenav').open();
                        $rootScope.$broadcast('territory_selected', $rootScope.selectedTerritory);
                    })
            );
        }

        function uploadBranchData(file, errFiles, event) {
            event.stopPropagation();

            if (!file || errFiles.length) {
                alertServices.showError('File is invalid.\nAccepts excel file only.\n .xlsx, .xls');
                return;
            }

            alertServices.showInfo('Uploading, Please wait...');

            branchService.uploadBranchData(file)
                .then(function (response) {
                    console.log('successfully uploaded branch data: ', response);
                    alertServices.showInfo('Branches uploaded.', true);
                }, function (error) {
                    console.log('error on uploading data: ', error);
                });
        }

        function uploadSalesData(file, errFiles, event) {
            event.stopPropagation();

            if (!file || errFiles.length) {
                alertServices.showError('File is invalid.\nAccepts excel file only.\n .xlsx, .xls');
                return;
            }

            alertServices.showInfo('Uploading, Please wait...');

            branchService.uploadBranchSellOutData(file)
                .then(function (response) {
                    console.log('successfully uploaded sales data: ', response);
                    alertServices.showInfo('Sellouts uploaded.', true);
                }, function (error) {
                    console.log('error on uploading data: ', error);
                });
        }

    }
}());