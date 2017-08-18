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

            if (!measurePolyline) measurePolyline = gmapServices.createDashedPolyline([startLatLng], '#3498db');
            else {
                if (measurePolyline) measurePolyline.setMap(gmapServices.map);
                measurePolyline.setPath([startLatLng]);
            }

            if (!measureInviMarker) measureInviMarker = gmapServices.initMarker(startLatLng, null, {visible: false});
            else {
                if (measureInviMarker) measureInviMarker.setMap(gmapServices.map);
                measureInviMarker.setPosition(startLatLng);
            }

            if (!measureLabel) measureLabel = new Label({map: gmapServices.map, text: ''});
            else measureLabel.setMap(gmapServices.map);

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
            measureMapObjects.forEach(function(obj, idx){
                measureMapObjects[idx].setMap(null);
                measureMapObjects[idx] = null;
            });
            measureMapObjects = [];
        }

        return service;
    }
}());