(function () {
    'use strict';

    angular.module('demoApp')
        .factory('locationService', ['$q', 'gmapServices', locationService]);

    function locationService($q, gmapServices) {
        var service = {};

        service.getCurrentLocation = getCurrentLocation;
        service.showCurrentLocation = showCurrentLocation;
        service.showDraggableLocation = showDraggableLocation;

        function getCurrentLocation () {
            if (!navigator.geolocation) {
                console.log('Browser doesnt support Geolocation');
                return false;
            }

            var dfd = $q.defer();

            navigator.geolocation.getCurrentPosition(function (response) {
                console.log('get current position: ', response);
                dfd.resolve(response);
            }, function (error){
                console.log('get current position error: ', error);
                dfd.reject(error);
            });

            return dfd.promise;
        }

        // Parameter must be a latLng
        function showCurrentLocation (position) {
            var latLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            var marker = gmapServices.showCurrentLocation(latLng);
            var offset = 0.002;


            gmapServices.panToOffsetLeft(latLng, offset);
            gmapServices.setZoomInDefault();

            return marker;
        }

        function showDraggableLocation () {
            var draggable = true,
                latLng = gmapServices.map.getCenter();

            var marker = gmapServices.showCurrentLocation(latLng, draggable);
            //gmapServices.panToOffsetLeft(latLng);

            return marker;
        }

        return service;
    }

}());