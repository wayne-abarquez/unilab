(function(){
'use strict';

angular.module('demoApp.sales')
    .factory('salesTransactionService', ['SalesTransaction', 'userSessionService', '$q', 'gmapServices', salesTransactionService]);

    function salesTransactionService (SalesTransaction, userSessionService, $q, gmapServices) {
        var service = {};

        var transactionTypes = {
            'CLIENT VISIT': {
                markerIcon: 'insurance-agency',
                color: '#f39c12',
                icon: 'store'
            },
            'GAS': {
                markerIcon: 'gas-station',
                color: '#e67e22',
                icon: 'local_gas_station'
            },
            'FLIGHT': {
                markerIcon: 'airport',
                color: '#16a085',
                icon: 'flight_takeoff'
            },

            'COVERAGE': {
                markerIcon: 'embassy',
                color: '#e67e22',
                icon: 'flag'
            },
            '1SS': {
                markerIcon: 'atm',
                color: '#3498db',
                icon: 'local_atm'
            },
            'C3S': {
                markerIcon: 'bank',
                color: '#9b59b6'
            },
            'IIDACS': {
                markerIcon: 'finance',
                color: '#3498db',
                icon: 'finance'
            },
            'FLEET': {
                markerIcon: 'taxi-stand',
                color: '#e74c3c',
                icon: 'local_taxi'
            }
        };

        var marker,
            transactionMarkerItem = null,
            transactionMarkers = [];

        service.saveTransaction = saveTransaction;
        service.getUserTransactions = getUserTransactions;
        service.showTransactionOnMap = showTransactionOnMap;
        service.initMarkers = initMarkers;
        service.showMarkers = showMarkers;
        service.hideMarkers = hideMarkers;

        function showMarkers () {
            transactionMarkerItem.setMap(null);

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

        function getIconByType (type) {
            var type = transactionTypes[type.toUpperCase()];

            return type
                    ? type
                    : transactionTypes[Object.keys(transactionTypes)[0]];
        }

        function createMarker (latlng, type) {
            icon = getIconByType(type);
            marker = gmapServices.createMapIconLabel(latlng, icon.markerIcon, icon.color);
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

        function getUserTransactions(pageNo, pageSize) {
            var dfd = $q.defer();

            var user = userSessionService.getUserInfo(true);

            if (user) {
                user.getList('salestransactions', {page_no: pageNo, page_size: pageSize})
                    .then(function (response) {
                        dfd.resolve(response.plain().map(function (item) {
                            item.icon = transactionTypes[item.type.toUpperCase()];
                            return item;
                        }));
                    }, function (error) {
                        dfd.reject(error);
                    });
            } else {
                dfd.reject();
            }

            return dfd.promise;
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
            if (transaction.start_point_latlng && gmapServices.directionsDisplay) gmapServices.directionsDisplay.setDirections({routes: []});

            if (transaction.start_point_latlng && transaction.end_point_latlng) {
                // show directions
                gmapServices.initializeDirectionsService();
                gmapServices.initializeDirectionsRenderer({draggable: false});

                calculateAndDisplayRoute(transaction.start_point_latlng, transaction.end_point_latlng);
            } else if (!transaction.start_point_latlng && transaction.end_point_latlng) {
                // show marker
                if (transactionMarkerItem) {
                    transactionMarkerItem.setMap(null);
                    transactionMarkerItem = null;
                }

                transactionMarkerItem = createMarker(transaction.end_point_latlng, transaction.type);
                transactionMarkerItem.setMap(gmapServices.map);

                gmapServices.setZoomIfGreater(15);
                gmapServices.panTo(transaction.end_point_latlng);
            }
        }

        return service;
    }
}());