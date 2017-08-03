(function(){
'use strict';

angular.module('demoApp')
    .factory('placesService', ['Place', '$rootScope', '$q', 'gmapServices', placesService]);

    function placesService (Place, $rootScope, $q, gmapServices) {
        var service = {};

        var placeTypesDelimiter = '|';

        var iconByplaceTypes = {
            'hospital': {
                icon: 'hospital',
                color: '#E91E63'
            },
            'pharmacy': {
                icon: 'health',
                color: '#9b59b6'
            },
            'shopping_mall': {
                icon: 'department-store',
                color: '#9b59b6'
            },
            'school': {
                icon: 'school',
                color: '#7f8c8d'
            },
            'convenience_store': {
                icon: 'convenience-store',
                color: '#f39c12'
            }
        };

        service.defaultPlaceTypes = [
            //'hospital',
            //'pharmacy'
        ];

        var poiMarkers = [],
            poiInfowindow;

        var abort1,
            abort2;

        service.loadPOIs = loadPOIs; // load within territory
        service.loadPOIsWithinBoundary = loadPOIsWithinBoundary;
        service.showPOIs = showPOIs;
        service.showPOIByType = showPOIByType;
        service.showVisiblePOIs = showVisiblePOIs;
        service.hidePOIs = hidePOIs;
        service.getPlaceTypes = getPlaceTypes;

        function loadPOIs (territoryId, typesArray) {
            var dfd = $q.defer();

            if (abort1) abort1.resolve();

            abort1 = $q.defer();

            Place.withHttpConfig({timeout: abort1.promise})
                .get('', {types: typesArray.join(placeTypesDelimiter), territoryid: territoryId})
                .then(function(response){
                    dfd.resolve(response.data);
                }, function(error){
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function loadPOIsWithinBoundary(boundaryId, typesArray) {
            var dfd = $q.defer();

            if (abort2) abort2.resolve();

            abort2 = $q.defer();

            Place.withHttpConfig({timeout: abort2.promise})
                .get('', {types: typesArray.join(placeTypesDelimiter), boundaryid: boundaryId})
                .then(function (response) {
                    console.log('places: ',response);
                    dfd.resolve(response.data);
                }, function (error) {
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function showPOIs(list, infowindow) {
            var marker,
                placeType;

            if (infowindow) poiInfowindow = infowindow;
            else if (!infowindow && !poiInfowindow) poiInfowindow = gmapServices.createInfoWindow('');

            hidePOIs();

            poiMarkers = [];

            for (var poiType in list) {
                list[poiType].forEach(function (item) {
                    placeType = getPlaceIcon(item.type);
                    marker = gmapServices.createMapIconLabel(item.geometry.location, placeType.icon || 'compass', placeType.color);
                    marker.name = item.name;
                    marker.type = item.type;
                    marker.content = '<b>' + item.name + '</b>';
                    marker.content += '<br>' + marker.type;

                    gmapServices.addListener(marker, 'click', function () {
                        poiInfowindow.open(gmapServices.map, this);
                        poiInfowindow.setContent(this.content);
                    });

                    poiMarkers.push(marker);
                });
            }

            $rootScope.$broadcast('compile-map-legend', {type: 'places', data: getMapLegendData(list)});
        }

        function getMapLegendData(list) {
            return Object.keys(list).map(function(type){
                return {
                    name: type.capitalize(),
                    iconPlace: getPlaceIcon(type)
                };
            });
        }

        function showPOIByType(type) {
            if (type == 'all') {
                poiMarkers.forEach(function (marker) {
                    if (!marker.getMap()) marker.setMap(gmapServices.map);
                });
                return;
            }

            poiMarkers.forEach(function (marker) {
                if (type != marker.type) {
                    marker.setMap(null);
                    return;
                }

                if (!marker.getMap()) marker.setMap(gmapServices.map);
            })
        }

        function showVisiblePOIs () {
            poiMarkers.forEach(function (marker) {
                if (marker && !marker.getMap()) marker.setMap(gmapServices.map);
            });
        }

        function hidePOIs() {
            poiMarkers.forEach(function (marker) {
                if (marker && marker.getMap()) marker.setMap(null);
            });
        }

        function getPlaceTypes() {
            var result = [];
            for (var key in iconByplaceTypes) {
                result.push(key);
            }
            return result;
        }

        function getPlaceIcon(placeType) {
            return iconByplaceTypes[placeType];
        }

        return service;
    }
}());