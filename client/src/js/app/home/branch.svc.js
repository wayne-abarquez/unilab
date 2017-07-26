(function(){
'use strict';

angular.module('demoApp.home')
    .factory('branchService', ['MARKER_BASE_URL', '$q', 'Branch', 'gmapServices', '$rootScope', branchService]);

    function branchService (MARKER_BASE_URL, $q, Branch, gmapServices, $rootScope) {
        var service = {};

        var branchMarkers = [],
            branchInfowindow;

        var branchIcons = {
            'mdc': 'branch-red.png',
            'lka': 'branch-green.png',
            'gt': 'branch-blue.png'
        };

        var iconBaseUrl = MARKER_BASE_URL;
        var unhighlightIcon = 'branch-default.png';

        service.saveBranch = saveBranch;
        service.loadMarkers = loadMarkers;
        service.showMarkers = showMarkers;
        service.hideMarkers = hideMarkers;
        service.toggleMarkers = toggle;
        service.dismissInfowindow = dismissInfowindow;
        service.getBranchById = getBranchById;
        service.getRestangularObj = getRestangularObj;
        service.highlightMarkers = highlightMarkers;
        service.resetMarkersColor = resetMarkersColor;
        service.unHighlightMarkers = unHighlightMarkers;
        service.unHighlightMarker = unHighlightMarker;
        service.animateMarker = animateMarker;
        service.clearAnimationMarker = clearAnimationMarker;
        service.deleteBranch = deleteBranch;
        service.newBranch = newBranch;
        service.triggerClickBranch = triggerClickBranch;
        service.loadProducts = loadProducts;


        function loadProducts (list) {
            var dfd = $q.defer();

            var branchIds = _.pluck(list, 'id');

            Branch.customPOST({branch_ids: branchIds}, 'products')
                .then(function(response){
                    dfd.resolve(response.plain());
                }, function(error){
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function triggerClickBranch (branchId) {
            var marker = getBranchById(branchId);

            if (!marker) return;

            gmapServices.trigger(marker, 'click');
        }

        // add to markers
        function newBranch (item, isProductSaturation) {
            var marker = gmapServices.initMarker(item.latlng, getBranchIconByType(item.type, isProductSaturation), {zIndex: 1});

            marker.content = '<div>';
            marker.content += '<h3 class="no-margin padding-left-5"><b>' + item.name + '</b></h3>';
            marker.content += '<h4 class="no-margin text-muted padding-left-5">' + item.type + '</h4>';

            if (!isProductSaturation) marker.content += '<button id="compare-branch-btn" data-branch-id="' + item.id + '" class="md-button md-raised md-primary">Compare</button>'

            //if ($rootScope.currentUser.role === 'ADMIN') {
                //if (isProductSaturation) {
                //    marker.content += '<button id="add-product-branch-btn" data-branch-id="' + item.id + '" class="md-button md-raised md-accent">Add Product</button>';
                //}

                //if (!isProductSaturation) {
                    //marker.content += '<button id="edit-branch-btn" data-branch-id="' + item.id + '" class="md-button md-raised md-warn">Edit</button>';
                    //marker.content += '<button id="delete-branch-btn" data-branch-id="' + item.id + '" class="md-button md-raised md-default">Delete</button>';
                //}
            //}

            marker.content += '</div>';

            marker.branch = angular.copy(item);
            marker.id = item.id;
            marker.touched = false;

            gmapServices.addListener(marker, 'click', function () {
                branchInfowindow.open(gmapServices.map, this);
                branchInfowindow.setContent(this.content);
            });

            branchMarkers.push(marker);
        }

        function saveBranch (data, id) {
            var dfd = $q.defer();

            if (id) { // update
                var restObj = Branch.cast(id);
                restObj.customPUT(data)
                    .then(function (response) {
                        dfd.resolve(response.plain());
                    }, function (error) {
                        dfd.reject(error);
                    });
            } else { // insert
                Branch.post(data)
                    .then(function(response){
                        var resp = response.plain();
                        console.log('post branch ', resp);
                        newBranch(resp.branch);
                        dfd.resolve(resp);
                    }, function(error){
                        dfd.reject(error);
                    });
            }

            return dfd.promise;
        }

        function getBranchIconByType (type, isProductSaturation) {
            if (!type || isProductSaturation) return iconBaseUrl + unhighlightIcon;

            return iconBaseUrl + branchIcons[type.toLowerCase()];
        }

        function loadMarkers (list, isProductSaturation) {

            hideMarkers();

            branchMarkers = [];

            if (!branchInfowindow) branchInfowindow = gmapServices.createInfoWindow('');

            list.forEach(function (item) {
                newBranch(item, isProductSaturation);
            });

            $rootScope.$broadcast('compile-map-legend', {type: 'branches', data: getMapLegendData(list)});
        }

        function getMapLegendData (list) {
            return _.pluck(_.uniq(list, function(item){
                return item.type;
            }), 'type').map(function(type){
                return {
                    name: type,
                    iconUrl: getBranchIconByType(type)
                };
            });
        }

        function showMarkers() {
            branchMarkers.forEach(function (marker) {
                if (marker && !marker.getVisible()) marker.setVisible(true);
            });
        }

        function hideMarkers () {
            branchMarkers.forEach(function (marker) {
                if (marker && marker.getVisible()) marker.setVisible(false);
            });

            if (branchInfowindow) branchInfowindow.close();
        }

        function toggle () {
            if (branchMarkers.length) {
                if (branchMarkers[0].getVisible()) {
                    hideMarkers();
                } else {
                    showMarkers();
                }
            }
        }

        function dismissInfowindow () {
            if (branchInfowindow) branchInfowindow.close();
        }

        function getBranchById (branchId) {
            return _.findWhere(branchMarkers, {id: branchId});
        }

        function getRestangularObj(branchId) {
            return Branch.cast(branchId);
        }

        function highlightMarkers (branchIds, isProductSat) {
            var icon,
                isFound,
                foundCtr = 0;


            if (isProductSat) {
                var toHighlightMarkers = _.filter(branchMarkers, function (itm) {
                    return branchIds.indexOf(itm.id) > -1;
                });

                toHighlightMarkers.forEach(function (item) {
                    item.setZIndex(2);
                    item.setIcon(getBranchIconByType(item.branch.type));
                    item.touched = true;
                    foundCtr++;
                });
                return;
            }

            branchMarkers.forEach(function(item){
                isFound = branchIds.indexOf(item.id) > -1;

                if (isFound) {
                    item.setZIndex(2);
                    item.setIcon(getBranchIconByType(item.branch.type));
                    item.touched = true;
                    foundCtr++;
                }

                //if (isFound) {
                //    item.setZIndex(2);
                //    foundCtr++;
                //}
                //icon = isFound
                //       ? getBranchIconByType(item.branch.type)
                //       : getBranchIconByType();
                //
                //item.setIcon(icon);
            });

            return foundCtr;
        }

        function resetMarkersColor (isProductSaturation) {
            var icon;

            if (isProductSaturation) {
                var touchedMarkers = _.where(branchMarkers, {touched: true});

                if (touchedMarkers.length) {
                    touchedMarkers.forEach(function (item) {
                        icon = getBranchIconByType(item.branch.type, isProductSaturation);
                        item.setIcon(getBranchIconByType(item.branch.type, isProductSaturation));
                        item.setZIndex(1);
                    });
                }
                return;
            }


            branchMarkers.forEach(function (item) {
                icon = getBranchIconByType(item.branch.type, isProductSaturation);

                if (item.getIcon() == icon) return;

                item.setIcon(icon);
                //item.setZIndex(1);
            });
        }

        function unHighlightMarkers() {
            var defaultIcon = getBranchIconByType();
            branchMarkers.forEach(function (item) {
                if (item.getIcon() != defaultIcon && !item.touched) {
                    item.setIcon(defaultIcon);
                    item.setAnimation(null);
                    item.setZIndex(1);
                }
            });

        }

        function unHighlightMarker (branchId) {
            var found = getBranchById(branchId);

            if (!found) return;

            found.touched = false;
            found.setIcon(getBranchIconByType());
            found.setZIndex(1);
            found.setAnimation(null);
        }

        function animateMarker (branchId) {
            var found = getBranchById(branchId);

            if (!found) return;

            //gmapServices.panToMarker(found);
            found.setAnimation(google.maps.Animation.BOUNCE);
        }

        function clearAnimationMarker (branchId) {
            var found = getBranchById(branchId);

            if (!found) return;

            found.setAnimation(null);
        }

        function deleteBranch(branchId) {
            var dfd = $q.defer();

            var restObj = getRestangularObj(branchId);

            restObj.remove()
                .then(function (response) {

                    dismissInfowindow();

                    var index = _.findIndex(branchMarkers, {id: branchId});

                    if (index > -1) {
                        if (branchMarkers[index] && branchMarkers[index].getMap()) {
                            branchMarkers[index].setVisible(false);
                            gmapServices.clearInstanceListeners(branchMarkers[index]);
                            branchMarkers[index].setMap(null);
                            branchMarkers[index] = null;
                            console.log('clearing branch marker');
                        }
                        branchMarkers.splice(index, 1);
                    }

                    dfd.resolve(response);
                }, function (error) {
                    console.log('error: ', error);
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        return service;
    }
}());