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

        service.loadMarkers = loadMarkers;
        service.showMarkers = showMarkers;
        service.hideMarkers = hideMarkers;
        service.toggleMarkers = toggle;
        service.getBranchById = getBranchById;
        service.getRestangularObj = getRestangularObj;
        //service.closeInfoWindowById = closeInfoWindowById;

        function getBranchIconByType (type) {
            return '/images/markers/' + branchIcons[type.toLowerCase()];
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

        function getBranchById (branchId) {
            return _.findWhere(branchMarkers, {id: branchId});
        }

        function getRestangularObj(branchId) {
            return Branch.cast(branchId);
        }

        //function closeInfoWindowById(branchId) {
        //    var found = getBranchById(branchId);
        //    if (found) found.infowindow.close();
        //}

        return service;
    }
}());