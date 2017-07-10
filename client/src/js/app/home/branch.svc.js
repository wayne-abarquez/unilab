(function(){
'use strict';

angular.module('demoApp.home')
    .factory('branchService', ['Branch', 'gmapServices', '$rootScope', branchService]);

    function branchService (Branch, gmapServices, $rootScope) {
        var service = {};

        var branchMarkers = [],
            branchInfowindow;

        var branchIcons = {
            'mdc': 'branch-red.png',
            'lka': 'branch-green.png',
            'gt': 'branch-blue.png'
        };

        var iconBaseUrl = '/images/markers/';
        var unhighlightIcon = 'branch-default.png';

        service.loadMarkers = loadMarkers;
        service.showMarkers = showMarkers;
        service.hideMarkers = hideMarkers;
        service.toggleMarkers = toggle;
        service.dismissInfowindow = dismissInfowindow;
        service.getBranchById = getBranchById;
        service.getRestangularObj = getRestangularObj;
        service.highlightMarkers = highlightMarkers;
        service.resetMarkersColor = resetMarkersColor;
        service.unHighlistMarker = unHighlistMarker;
        service.animateMarker = animateMarker;
        service.clearAnimationMarker = clearAnimationMarker;
        //service.closeInfoWindowById = closeInfoWindowById;

        function getBranchIconByType (type) {
            if (!type) return iconBaseUrl + unhighlightIcon;

            return iconBaseUrl + branchIcons[type.toLowerCase()];
        }

        function loadMarkers (list) {
            var marker;

            hideMarkers();
            branchMarkers = [];

            if (!branchInfowindow) branchInfowindow = gmapServices.createInfoWindow('');

            list.forEach(function (item) {
                marker = gmapServices.initMarker(item.latlng, getBranchIconByType(item.type));

                //marker.infowindow = gmapServices.createInfoWindow('');
                //marker.infowindow.branchId = item.id;

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
                    //this.infowindow.open(gmapServices.map, this);
                    //this.infowindow.setContent(this.content);
                    branchInfowindow.open(gmapServices.map, this);
                    branchInfowindow.setContent(this.content);
                });

                //google.maps.event.addListener(marker.infowindow, 'closeclick', function () {
                //    console.log('infowindow close.!');
                //    // if current branch was added as compare then remove it on the table when infowindow closed
                //    $rootScope.$broadcast('branch-infowindow-closed', {id: this.branchId});
                //});

                branchMarkers.push(marker);
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
                else item.setZIndex(1);
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

        function unHighlistMarker (branchId) {
            var found = getBranchById(branchId);

            if (!found) return;

            found.setIcon(getBranchIconByType());
            item.setZIndex(1);
        }

        function animateMarker (branchId) {
            var found = getBranchById(branchId);

            found.setAnimation(google.maps.Animation.BOUNCE);
        }

        function clearAnimationMarker (branchId) {
            var found = getBranchById(branchId);
            found.setAnimation(null);
        }

        //function closeInfoWindowById(branchId) {
        //    var found = getBranchById(branchId);
        //    if (found) found.infowindow.close();
        //}

        return service;
    }
}());