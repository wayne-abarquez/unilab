(function(){
'use strict';

angular.module('demoApp')
    .factory('mapToolsService', ['gmapServices', mapToolsService]);

    function mapToolsService (gmapServices) {
        var service = {};

        var measurePolyline,
            measureMapObjects = [],
            measureInviMarker,
            measureLabel;

        var distance,
            measureListeners = [],
            measurePaths = [];

        service.activateMeasureDistanceTool = activateMeasureDistanceTool;
        service.deactivateMeasureDistanceTool = deactivateMeasureDistanceTool;
        service.clearMeasurementLines = clearMeasurementLines;

        function redrawLine (startLatlng, endLatlng) {
            //var newPath = measurePaths.concat([endLatlng]);
            //if (measurePaths.length > 1) {
            //    measureInviMarker.setPosition(newPath[Math.abs(newPath.length / 2)]);
            //
            //} else {
                measureInviMarker.setPosition(google.maps.geometry.spherical.interpolate(startLatlng, endLatlng, 0.5));
            //}

            measurePolyline.setPath([startLatlng, endLatlng]);

            distance = google.maps.geometry.spherical.computeDistanceBetween(startLatlng, endLatlng);
            //distance = google.maps.geometry.spherical.computeLength(newPath);

            var content = distance.toFixed(2) + ' m';
            measureLabel.setContent(content);
        }

        function activateMeasureDistanceTool (startLatLng) {
            //measurePaths = [];
            //measurePaths.push(startLatLng);
            measurePolyline = gmapServices.createDashedPolyline([startLatLng], '#3498db');

            measureInviMarker = gmapServices.initMarker(startLatLng, null, {visible: false});

            measureLabel = new Label({map: gmapServices.map, text: ''});

            measureLabel.bindTo('position', measureInviMarker, 'position');

            measureListeners.push(
                gmapServices.addMapListener('mousemove', function(e){
                    redrawLine(startLatLng, e.latLng);
                })
            );

            //measureListeners.push(
            //    gmapServices.addMapListener('click', function(e){
            //        measureListeners.forEach(function (listener) {
            //            gmapServices.removeListener(listener);
            //        });
            //        measureListeners = [];
            //    })
            //);

            //measureListeners.push(
            //    gmapServices.addMapListener('dblclick', function (e) {
            //        console.log('dbl clicked!');
            //        measureListeners.forEach(function(listener){
            //            gmapServices.removeListener(listener);
            //        });
            //        measureListeners = [];
            //    })
            //);
        }

        function deactivateMeasureDistanceTool (endLatlng) {
            redrawLine(measurePolyline.getPath().getArray()[0], endLatlng);
            measureMapObjects.push(measurePolyline);
            measureMapObjects.push(measureInviMarker);
            measureMapObjects.push(measureLabel);
            measureListeners.forEach(function (listener) {
                gmapServices.removeListener(listener);
            });
            measureListeners = [];
        }

        function clearMeasurementLines () {
            measureMapObjects.forEach(function(obj){
                obj.setMap(null);
            });
            measureMapObjects = [];
        }

        return service;
    }
}());