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

        vm.boundaries = [];
        vm.territories = [];
        vm.showTerritoriesPanel = false;

        var lastSelectedObj;

        vm.expandCallback = expandCallback;
        vm.showBoundary = showBoundary;
        vm.showTerritory = showTerritory;
        //vm.boundaryCheckboxChange = boundaryCheckboxChange;
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
                console.log('set poly options color: ', color);
            } else {
                polygonObj = gmapServices.createPolygon(latLngArray, color);
            }

            console.log('showPolygon: ',polygonObj);
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
            console.log('show boundary: ',boundary);

            if (boundary.typeid == 6) {
                $('v-pane#' + boundary.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'block'});
            } else {
                $('md-list-item#' + item.id.toString() + ' md-progress-circular').show();
            }


            //if (lastSelectedObj
            //    && boundary.typeid == 6
            //    && lastSelectedObj.hasOwnProperty('model')
            //    && lastSelectedObj.id != boundary.id) {
            //    console.log('lastSelectedObj: ', lastSelectedObj);
            //    lastSelectedObj.model = false;
            //    lastSelectedObj.isExpanded = false;
            //}
            //
            //if (boundary.typeid == 6) lastSelectedObj = boundary;

            branchService.hideMarkers();
            placesService.hidePOIs();

            //var promises = [];

            item.get()
                .then(function (response) {
                    var resp = response.plain();

                    console.log('show boundary from admin: ', resp);

                    showPolygon(resp.geometry);
                    gmapServices.setZoomIfGreater(12);
                    gmapServices.panToPolygon(polygonObj);

                    if (!resp.geometry.length) {
                        $timeout(function () {
                            if (boundary.typeid === 6) $('v-pane#' + boundary.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'none'});
                            else $('md-list-item#' + item.id.toString() + ' md-progress-circular').hide();
                        }, 500);
                        return;
                    }

                    // load branches
                    item.getList('branches')
                        .then(function (response) {
                            var resp = response.plain();

                            if (!resp.length) {
                                alertServices.showBottomLeftToast('This territory doesnt have branch yet.');
                                return;
                            }

                            branchService.loadMarkers(resp.map(function (item) {
                                return item.branch;
                            }));

                            console.log('get list markers from admin: ',resp);
                        })
                        .finally(function(){
                            $timeout(function () {
                                if (boundary.typeid === 6) $('v-pane#' + boundary.id.toString() + ' v-pane-header md-progress-circular').css({'display': 'none'});
                                else $('md-list-item#' + item.id.toString() + ' md-progress-circular').hide();
                            }, 500);
                        });

                    // load places
                    if (vm.loadPois && !isParent && resp.geometry.length) {
                            placesService.loadPOIsWithinBoundary(boundary.id, selectedTypes)
                                .then(function (response) {
                                    placesService.showPOIs(response);
                                });
                    }
                });

            //$q.all([promises])
            //    .finally(function () {
            //        $timeout(function () {
            //            $('md-list-item#' + item.id.toString() + ' md-progress-circular').hide();
            //        }, 1000);
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
                            showBoundary(item);
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

        //function hideMapObjects() {
        //    branchService.hideMarkers();
        //    placesService.hidePOIs();
        //
        //    if (polygonObj && polygonObj.getMap()) {
        //        polygonObj.setMap(null);
        //    }
        //}

        //function boundaryCheckboxChange (city) {
        //    if (city.model) {
        //        showBoundary(city, true);
        //        return;
        //    }
        //
        //    // hide poly
        //    hideMapObjects();
        //}

    }
}());