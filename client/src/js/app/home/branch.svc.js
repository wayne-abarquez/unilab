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
        service.unHighlightMarker = unHighlightMarker;
        service.animateMarker = animateMarker;
        service.clearAnimationMarker = clearAnimationMarker;
        service.deleteBranch = deleteBranch;
        service.newBranch = newBranch;
        //service.closeInfoWindowById = closeInfoWindowById;

        // add to markers
        function newBranch (item) {
            var marker = gmapServices.initMarker(item.latlng, getBranchIconByType(item.type), {zIndex: 1});

            marker.content = '<div>';
            marker.content += '<h3 class="no-margin padding-left-5"><b>' + item.name + '</b></h3>';
            marker.content += '<h4 class="no-margin text-muted padding-left-5">' + item.type + '</h4>';

            marker.content += '<button id="compare-branch-btn" data-branch-id="' + item.id + '" class="md-button md-raised md-primary">Compare</button>'

            if ($rootScope.currentUser.role === 'ADMIN') {
                marker.content += '<button id="edit-branch-btn" data-branch-id="' + item.id + '" class="md-button md-raised md-default">Edit</button>';
                marker.content += '<button id="delete-branch-btn" data-branch-id="' + item.id + '" class="md-button md-raised md-warn">Delete</button>';
            }

            marker.content += '</div>';

            marker.branch = angular.copy(item);
            marker.id = item.id;

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

        function getBranchIconByType (type) {
            if (!type) return iconBaseUrl + unhighlightIcon;

            return iconBaseUrl + branchIcons[type.toLowerCase()];
        }

        function loadMarkers (list) {

            hideMarkers();

            branchMarkers = [];

            if (!branchInfowindow) branchInfowindow = gmapServices.createInfoWindow('');

            list.forEach(function (item) {
                newBranch(item);
            });

            $rootScope.$broadcast('compile-map-legend', {type: 'branches', data: getMapLegendData(list)});

            console.log('branch markers loaded');
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

        function highlightMarkers (branchIds) {
            var icon,
                isFound;

            branchMarkers.forEach(function(item){
                isFound = branchIds.indexOf(item.id) > -1;

                icon = branchIds.indexOf(item.id) > -1
                       ? getBranchIconByType(item.branch.type)
                       : getBranchIconByType();

                item.setIcon(icon);

                if (isFound) item.setZIndex(2);
            });
        }

        function resetMarkersColor () {
            var icon;

            branchMarkers.forEach(function (item) {
                icon = getBranchIconByType(item.branch.type)
                item.setIcon(icon);
                item.setZIndex(1);
            });
        }

        function unHighlightMarker (branchId) {
            var found = getBranchById(branchId);

            if (!found) return;

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