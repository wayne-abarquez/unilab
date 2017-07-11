(function () {
    'use strict';

    angular.module('demoApp')
        .factory('locationService', ['$q', 'gmapServices', locationService]);

    function locationService($q, gmapServices) {
        var service = {};

        service.getCurrentLocation = getCurrentLocation;
        service.showCurrentLocation = showCurrentLocation;
        service.showDraggableLocation = showDraggableLocation;

        function transformResponse (response) {
            return {
                lat: response.coords.latitude,
                lng: response.coords.longitude
            };
        }

        function getCurrentLocation () {
            if (!navigator.geolocation) {
                console.log('Browser doesnt support Geolocation');
                return false;
            }

            var dfd = $q.defer();

            navigator.geolocation.getCurrentPosition(function (response) {
                dfd.resolve(transformResponse(response));
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

            return marker;
        }

        return service;
    }

}());