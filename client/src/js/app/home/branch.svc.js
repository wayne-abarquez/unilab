(function(){
'use strict';

angular.module('demoApp.home')
    .factory('branchService', ['gmapServices', branchService]);

    function branchService (gmapServices) {
        var service = {};

        var branchMarkers = [];

        service.loadMarkers = loadMarkers;
        service.showMarkers = showMarkers;
        service.hideMarkers = hideMarkers;
        service.toggleMarkers = toggle;

        function loadMarkers (list) {
            var marker;

            hideMarkers();
            branchMarkers = [];

            list.forEach(function (item) {
                marker = gmapServices.createCircleMarker(item.latlng);

                marker.infowindow = gmapServices.createInfoWindow('');

                marker.content = '<div>';
                marker.content += '<b>' + item.name + '</b>';
                marker.content += '<br>' + item.type + '<br>';
                marker.content += '<button id="edit-branch-btn" data-branch-id="' + item.id + '" class="md-button md-raised md-primary">Edit</button>';
                marker.content += '<button id="compare-branch-btn" data-branch-id="' +item.id+ '" class="md-button md-raised md-default">Compare</button>';
                marker.content += '</div>';

                gmapServices.addListener(marker, 'click', function () {
                    this.infowindow.open(gmapServices.map, this);
                    this.infowindow.setContent(this.content);
                });

                marker = angular.merge(marker, item);

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

        return service;
    }
}());