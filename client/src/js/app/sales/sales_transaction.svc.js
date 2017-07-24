(function(){
'use strict';

angular.module('demoApp.sales')
    .factory('salesTransactionService', ['$rootScope', 'SalesTransaction', 'userSessionService', '$q', 'gmapServices', 'MARKER_BASE_URL', salesTransactionService]);

    function salesTransactionService ($rootScope, SalesTransaction, userSessionService, $q, gmapServices, MARKER_BASE_URL) {
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
                color: '#9b59b6',
                icon: 'account_balance'
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

        var iconByStatus = {
            'CLEARED': 'transaction-default.png',
            'FRAUD': 'transaction-fraud.png',
            'INVESTIGATE': 'transaction-investigate.png'
        };

        var marker,
            transactionMarkerItem = null,
            infowindow = null,
            transactionMarkers = [];

        service.saveTransaction = saveTransaction;
        service.getUserTransactions = getUserTransactions;
        service.showTransactionOnMap = showTransactionOnMap;
        service.initMarkers = initMarkers;
        service.showMarkers = showMarkers;
        service.hideMarkers = hideMarkers;
        service.getIconByType = getIconByType;
        service.showMarkerById = showMarkerById;
        service.getTransactionById = getTransactionById;
        service.updateTransactionStatus = updateTransactionStatus;

        function updateTransactionStatus (id, status) {
            var transaction = getTransactionById(id);

            console.log('updateTransactionStatus');

            console.log('transactionMarker', transaction);
            if (!transaction) return;

            transaction.status = status;

            transaction.marker.setIcon(getMarkerIconByStatus(transaction.status));

            setInfowindowContent(transaction, transaction.marker);
            infowindow.setContent(transaction.marker.content);
        }

        function getTransactionById(transactionId) {
            return _.findWhere(transactionMarkers, {id: transactionId});
        }

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

        function getMarkerIconByStatus(status) {
            if (!status) return MARKER_BASE_URL + 'transaction-default.png';

            return MARKER_BASE_URL + iconByStatus[status.toUpperCase()];
        }

        function createMarker (latlng, item, isFromFraud) {
            //marker = gmapServices.createMapIconLabel(latlng, icon.markerIcon, icon.color);
            icon = getMarkerIconByStatus(item.status);
            marker = gmapServices.initMarker(latlng, icon);
            if (!isFromFraud) marker.setMap(null);
            return marker;
        }

        function setInfowindowContent (item, marker) {
            marker.content = '<div>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Employee: </b> ' + 'Randy Ambito' + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Transaction Type: </b> ' + item.type + '</p>';

            if (item.merchant) {
                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Merchant Name: </b>' + item.merchant.name + '</p>';
                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Merchant Address: </b>' + item.merchant.address + '</p>';
            }

            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Description: </b> ' + item.description + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Amount: </b> ' + item.cost + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Date: </b> ' + item.transaction_date_formatted + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Difference: </b> ' + item.travel_time_in_minutes + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Average Travel Time: </b> ' + item.average_travel_time_in_minutes + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Status: </b> ' + item.status + '</p>';

            marker.content += '<label class="text-muted"  style="padding:0.5rem 0 0 0.5rem;"><b>Validation Remarks: </b></label>';
            marker.content += '<textarea class="textarea" rows="2" cols="20" placeholder="Enter validation remarks here...">' + (item.remarks ? item.remarks : '') + '</textarea>'

            if (item.status != 'FRAUD' && item.status != 'CLEARED') marker.content += '<button id="mark-fraud-btn" data-transaction-id="' + item.id + '" class="md-button md-raised md-warn">Fraud</button>';
            if (item.status != 'CLEARED') marker.content += '<button id="mark-cleared-btn" data-transaction-id="' + item.id + '" class="md-button md-raised md-default">Cleared</button>';
            if (!item.status) marker.content += '<button id="mark-investigate-btn" data-transaction-id="' + item.id + '" class="md-button md-raised md-accent">Investigate</button>';

            marker.content += '</div>';

        }

        function createContentForInfowindow (item, marker) {
            setInfowindowContent(item, marker);

            marker.transaction = angular.copy(item);

            gmapServices.addListener(marker, 'click', function () {
                infowindow.open(gmapServices.map, this);
                infowindow.setContent(this.content);

                showTransactionOnMap(this.transaction, true);
            });
        }

        function addTransaction (item, isFromFraud) {
            var obj = angular.copy(item);

            if (item.end_point_latlng) {
                obj.marker = createMarker(item.end_point_latlng, item, isFromFraud);
            } else if(item.start_point_latlng) {
                obj.marker = createMarker(item.start_point_latlng, item, isFromFraud);
            }

            obj.marker.id = item.id;

            if (obj.marker) {
                createContentForInfowindow(item, obj.marker);
            }

            return obj;
        }

        function initMarkers (list, isFromFraud) {
            if (!infowindow) infowindow = gmapServices.createInfoWindow('');

            transactionMarkers = list.map(function(item){
                return addTransaction(item, isFromFraud);
            });

            var mapLegendData = getMapLegendData(list);
            console.log('mapLegendData: ', mapLegendData);
            $rootScope.$broadcast('compile-map-legend', {type: 'transactions', data: mapLegendData});

            return transactionMarkers;
        }

        function getMapLegendData(list) {
            console.log('getMapLegendData: ',list);
            return _.pluck(_.uniq(list, function (item) {
                return item.type;
            }), 'status').map(function (stat) {
                return {
                    name: stat,
                    iconUrl: getMarkerIconByStatus(stat)
                };
            });
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

        function getIconColorByStatus (status) {
        console.log('getIconColorByStatus: ',status);
            if (!status) return '#95a5a6';

            switch (status.toUpperCase()) {
                case 'CLEARED':
                    return '#2ecc71';
                case 'FRAUD':
                    return '#e74c3c';
                case 'INVESTIGATE':
                    return '#f39c12';
            }
        }

        function getUserTransactions(pageNo, pageSize) {
            var dfd = $q.defer();

            var user = userSessionService.getUserInfo(true);

            if (user) {
                user.getList('salestransactions', {page_no: pageNo, page_size: pageSize})
                    .then(function (response) {
                        dfd.resolve(response.plain().map(function (item) {
                            item.icon = transactionTypes[item.type.toUpperCase()];
                            item.icon.color = getIconColorByStatus(item.status);
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


        function showTransactionOnMap (transaction, isFromFraud) {
            if (transaction.start_point_latlng && gmapServices.directionsDisplay) gmapServices.directionsDisplay.setDirections({routes: []});

            if (transaction.start_point_latlng && transaction.end_point_latlng) {
                // show directions
                gmapServices.initializeDirectionsService();
                gmapServices.initializeDirectionsRenderer({draggable: false});

                calculateAndDisplayRoute(transaction.start_point_latlng, transaction.end_point_latlng);
            } else if (!transaction.start_point_latlng && transaction.end_point_latlng && !isFromFraud) {
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

        function showMarkerById(id) {
            var found = _.findWhere(transactionMarkers, {id: id});
            if (found && found.marker) {
                if (!found.marker.getMap()) found.marker.setMap(gmapServices.map);

                gmapServices.setZoomIfGreater(18);
                gmapServices.panToMarker(found.marker);

                // show infowindow
                gmapServices.triggerEvent(found.marker, 'click');
            }
        }

        return service;
    }
}());