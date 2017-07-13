(function(){
'use strict';

angular.module('demoApp.sales')
    .factory('salesTransactionService', ['SalesTransaction', 'userResourcesService', '$q', 'gmapServices', salesTransactionService]);

    function salesTransactionService (SalesTransaction, userResourcesService, $q, gmapServices) {
        var service = {};

        var markerIconByType = {
            'CLIENT VISIT': {
                icon: 'insurance-agency',
                color: '#e67e22'
            },
            'GAS': {
                icon: 'gas-station',
                color: '#e74c3c'
            },
            'FLIGHT': {
                icon: 'airport',
                color: '#3498db'

            },

            'COVERAGE': {
                icon: 'embassy',
                color: '#3498db'
            },
            '1SS': {
                icon: 'atm',
                color: '#3498db'
            },
            'C3S': {
                icon: 'bank',
                color: '#3498db'
            },
            'IIDACS': {
                icon: 'finance',
                color: '#3498db'
            },
            'FLEET': {
                icon: 'taxi-stand',
                color: '#3498db'
            }
        };

        var marker,
            transactionMarkers = [];

        service.saveTransaction = saveTransaction;
        service.getUserTransactions = getUserTransactions;
        service.showTransactionOnMap = showTransactionOnMap;
        service.initMarkers = initMarkers;
        service.showMarkers = showMarkers;
        service.hideMarkers = hideMarkers;

        function showMarkers () {
            transactionMarkers.forEach(function(item){
               if (item.marker && !item.marker.getMap()) {
                   item.marker.setMap(gmapServices.map);
               }
            });
        }

        function hideMarkers() {
            transactionMarkers.forEach(function (item) {
                if (item.marker && item.marker.getMap()) {
                    item.marker.setMap(null);
                }
            });
        }

        var icon;

        function createMarker (latlng, type) {
            icon = markerIconByType[type.toUpperCase()];
            marker = gmapServices.createMapIconLabel(latlng, icon.icon, icon.color);
            marker.setMap(null);
            return marker;
        }

        function addTransaction (item) {
            var obj = angular.copy(item);
            obj.marker = createMarker(item.end_point_latlng, item.type);
            return obj;
        }

        function initMarkers (list) {
            transactionMarkers = list.map(function(item){
                return addTransaction(item);
            });

            return transactionMarkers;
        }

        function saveTransaction(data, id) {
            var dfd = $q.defer();

            if (id) { // update
                var restObj = SalesTransaction.cast(id);
                restObj.customPUT(data)
                    .then(function (response) {
                        dfd.resolve(response.plain());
                    }, function (error) {
                        dfd.reject(error);
                    });
            } else { // insert
                SalesTransaction.post(data)
                    .then(function (response) {
                        var resp = response.plain();
                        var transactionItem = addTransaction(resp.sales_transaction);
                        gmapServices.showMarker(transactionItem.marker);
                        transactionMarkers.push(transactionItem);
                        dfd.resolve(resp);
                    }, function (error) {
                        dfd.reject(error);
                    });
            }

            return dfd.promise;
        }

        function getUserTransactions () {
            return userResourcesService.getUserTransactions();
        }

        function calculateAndDisplayRoute(originLatlng, destinationLatLng) {
            gmapServices.directionsService.route({
                origin: originLatlng,
                destination: destinationLatLng,
                travelMode: 'DRIVING'
            }, function (response, status) {
                if (status === 'OK') {
                    gmapServices.directionsDisplay.setDirections(response);
                } else {
                    console.log('Directions request failed due to ' + status);
                }
            });
        }


        function showTransactionOnMap (transaction) {
            if (gmapServices.directionsDisplay) gmapServices.directionsDisplay.setDirections({routes: []});

            if ( !_.isEmpty(transaction.start_point_latlng) && !_.isEmpty(transaction.end_point_latlng)) {
                // show directions
                gmapServices.initializeDirectionsService();
                gmapServices.initializeDirectionsRenderer({draggable: false});

                calculateAndDisplayRoute(transaction.start_point_latlng, transaction.end_point_latlng);
            } else if (_.isEmpty(transaction.start_point_latlng) && !_.isEmpty(transaction.end_point_latlng)) {
                // show marker
            }
        }

        return service;
    }
}());