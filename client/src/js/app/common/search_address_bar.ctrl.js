(function () {
    'use strict';

    angular.module('demoApp')
        .controller('searchAddressBarController', ['$rootScope', 'gmapServices', 'alertServices', 'locationService', searchAddressBarController]);

    function searchAddressBarController($rootScope, gmapServices, alertServices, locationService) {
        var vm = this;

        var autocomplete = null;

        vm.getGPSLocation = getGPSLocation;

        initialize();

        function initialize() {
            autocomplete = gmapServices.initializeAutocomplete('filter-location-input', {
                componentRestrictions: {country: 'ph'}
            });
            
            autocomplete.addListener('place_changed', placeChangeCallback);

            $rootScope.$on('clear-search-address-bar', function(e){
                vm.query = '';
            });
        }

        function placeChangeCallback() {
            var place = autocomplete.getPlace();

            if (!place.geometry) {
                alertServices.showInfo("Address not found.");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                gmapServices.map.fitBounds(place.geometry.viewport);
            } else {
                gmapServices.map.setCenter(place.geometry.location);
                gmapServices.map.setZoom(15);
            }

            $rootScope.$broadcast('search-address-return-result', {result: place});
        }

        function getGPSLocation () {
            locationService.getCurrentLocation()
                .then(function(latlng){

                }, function (error){
                    alertServices.showError(error.message);
                });
        }

    }
}());