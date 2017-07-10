(function(){
'use strict';

angular.module('demoApp')
    .factory('placesService', ['Place', '$q', 'gmapServices', placesService]);

    function placesService (Place, $q, gmapServices) {
        var service = {};

        var iconByplaceTypes = {
            'hospital': {
                icon: 'hospital',
                color: '#f1c40f'
            },
            'airport': {
                icon: 'airport',
                color: '#3498db'
            },
            'bank': {
                icon: 'bank',
                color: '#f1c40f'
            },
            'lodging': {
                icon: 'lodging',
                color: '#16a085'
            },
            'school': {
                icon: 'school',
                color: '#7f8c8d'
            },
            'restaurant': {
                icon: 'restaurant',
                color: '#e67e22'
            },
            'shopping_mall': {
                icon: 'department-store',
                color: '#9b59b6'
            },
            'park': {
                icon: 'park',
                color: '#2ecc71'
            },
            'church': {
                icon: 'church',
                color: '#27ae60'
            },
            'museum': {
                icon: 'museum',
                color: '#95a5a6'
            },
            'cafe': {
                icon: 'cafe',
                color: '#f39c12'
            },
            'establishment': {
                icon: 'local-government',
                color: '#1abc9c'
            }
        };

        service.defaultPlaceTypes = [
            'hospital',
            'airport',
            'bank',
            'lodging',
            'school',
            'restaurant',
            'shopping_mall'
        ];

        var poiMarkers = [],
            poiInfowindow;

        service.loadPOIs = loadPOIs;
        service.showPOIs = showPOIs;
        service.showPOIByType = showPOIByType;
        service.hidePOIs = hidePOIs;
        service.getPlaceTypes = getPlaceTypes;

        function loadPOIs (territoryId) {
            var dfd = $q.defer();

            Place.get('', {types: 'hospital|clinic|schools|universities|shopping_mall', territoryid: territoryId})
                .then(function(response){
                    //console.log('places: ',response);
                    dfd.resolve(response.data);
                }, function(error){
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function showPOIs(data) {
            var marker,
                placeType;

             if (!poiInfowindow) poiInfowindow = gmapServices.createInfoWindow('');

            hidePOIs();

            poiMarkers = [];

            for (var poiType in data) {
                data[poiType].forEach(function (item) {
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
        }

        function showPOIByType(type) {
            if (type == 'all') {
                poiMarkers.forEach(function (marker) {
                    if (!marker.getVisible()) marker.setVisible(true);
                });
                return;
            }

            poiMarkers.forEach(function (marker) {
                if (type != marker.type) {
                    marker.setVisible(false);
                    return;
                }

                if (!marker.getVisible()) marker.setVisible(true);
            })
        }

        function hidePOIs() {
            poiMarkers.forEach(function (marker) {
                if (marker && marker.getVisible()) marker.setVisible(false);
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