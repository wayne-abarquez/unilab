(function() {
    'use strict';

    angular.module('demoApp.sales')
        .factory('salesTransactionService', ['$rootScope', 'SalesTransaction', 'userSessionService', '$q', 'gmapServices', 'MARKER_BASE_URL', salesTransactionService]);

    function salesTransactionService($rootScope, SalesTransaction, userSessionService, $q, gmapServices, MARKER_BASE_URL) {
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
            'INVESTIGATING': 'transaction-investigate.png'
        };

        var marker,
        transactionMarkerItem = null,
            infowindow = null,
            inviMarker,
            transactionMarkers = [],
            inviMarkers = [],
            transactionList = [];

        var labels = {
            nextTransaction: null,
            previousTransaction: null
        };

        var nextTransactionDirectionsDisplay,
        previousTransactionDirectionsDisplay;

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
        service.resetMarkers = resetMarkers;
        service.resetTransactionVisuals = resetTransactionVisuals;
        service.saveTransactionRemarks = saveTransactionRemarks;

        function saveTransactionRemarks(transactionId, remarks) {
            var dfd = $q.defer();

            var restObj = SalesTransaction.cast(transactionId);

            restObj.customPUT({
                'remarks': remarks
            })
                .then(function(response) {

                var foundIndex = _.findIndex(transactionMarkers, {
                    id: transactionId
                });

                if (foundIndex > -1) {
                    transactionMarkers[foundIndex].remarks = remarks;
                    transactionMarkers[foundIndex].marker.transaction.remarks = remarks;
                    transactionMarkers[foundIndex].marker.content = setInfowindowContent(transactionMarkers[foundIndex], transactionMarkers[foundIndex].marker);
                }

                dfd.resolve(response.plain());
            }, function(error) {
                dfd.reject(error);
            });

            return dfd.promise;
        }

        function updateTransactionStatus(id, status) {
            var dfd = $q.defer();

            var restObj = SalesTransaction.cast(id);

            restObj.customPUT({
                'status': status
            })
                .then(function(response) {

                var transaction = getTransactionById(id);

                if (!transaction) return;

                transaction.status = status;

                transaction.marker.setIcon(getMarkerIconByStatus(transaction.status));

                setInfowindowContent(transaction, transaction.marker);
                infowindow.setContent(transaction.marker.content);

                dfd.resolve(response.plain());
            }, function(error) {
                dfd.reject(error);
            });

            return dfd.promise;
        }

        function getTransactionById(transactionId) {
            return _.findWhere(transactionMarkers, {
                id: transactionId
            });
        }

        function showMarkers() {
            transactionMarkerItem.setMap(null);

            transactionMarkers.forEach(function(item) {
                if (item.marker && !item.marker.getMap()) {
                    item.marker.setMap(gmapServices.map);
                }
            });
        }

        function hideMarkers() {
            transactionMarkers.forEach(function(item) {
                if (item.marker && item.marker.getMap()) {
                    item.marker.setMap(null);
                }
            });
        }

        var icon;

        function getIconByType(type) {
            var type = transactionTypes[type.toUpperCase()];

            return type ? type : transactionTypes[Object.keys(transactionTypes)[0]];
        }

        function getMarkerIconByStatus(status) {
            if (!status) return MARKER_BASE_URL + 'transaction-default.png';

            return MARKER_BASE_URL + iconByStatus[status.toUpperCase()];
        }

        function createMarker(latlng, item, isFromFraud) {
            icon = getMarkerIconByStatus(item.status);
            marker = gmapServices.initMarker(latlng, icon);
            if (!isFromFraud) marker.setMap(null);
            return marker;
        }

        function setInfowindowContent(item, marker, index) {
            marker.content = '<div>';
            //marker.content += '<p class="no-margin text-muted padding-left-5"><b>Employee: </b> ' + 'Randy Ambito' + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Transaction Type: </b> ' + (item.type ? item.type : '') + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Status: </b> ' + (item.status ? item.status : '') + '</p>';

            if (item.merchant && item.merchant.name) {
                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Merchant Name: </b>' + item.merchant.name + '</p>';
                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Merchant Address: </b>' + item.merchant.address + '</p>';
            }

            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Description: </b> ' + (item.description ? item.description : '') + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Amount: </b> ' + (item.cost ? item.cost : '') + '</p>';
            marker.content += '<p class="no-margin text-muted padding-left-5"><b>Transaction Date: </b> ' + (item.transaction_date_formatted ? item.transaction_date_formatted : '') + '</p>';

            marker.content += '<br>';

            if (item.average_travel_time_in_minutes && item.travel_distance_in_km) {
                marker.content += '<p class="no-margin text-muted padding-left-5" style="color:#f39c12;"><b>Previous Transaction</b></p>';
                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Actual Travel Time: </b> ' + (item.travel_time_in_minutes ? item.travel_time_in_minutes + ' mins' : '') + '</p>';
                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Average Travel Time: </b> ' + (item.average_travel_time_in_minutes ? item.average_travel_time_in_minutes + ' mins' : '') + '</p>';
                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Distance: </b> ' + (item.travel_distance_in_km ? item.travel_distance_in_km + ' km' : '') + '</p>';

                var prevTravelDiff = Math.abs(item.travel_time_in_minutes - item.average_travel_time_in_minutes);

                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Difference: </b> ' + (item.travel_time_in_minutes && item.average_travel_time_in_minutes ? prevTravelDiff.toFixed(2) + ' mins' : '') + '</p>';

                marker.content += '<br>';
            }

            if (item.next_average_travel_time_in_minutes && item.next_travel_distance_in_km) {
                marker.content += '<p class="no-margin text-muted padding-left-5" style="color:#27ae60;"><b>Next Transaction</b></p>';

                if (transactionList.length > 1 && index < transactionList.length - 1) {
                    marker.content += '<p class="no-margin text-muted padding-left-5"><b>Actual Travel Time: </b> ' + (transactionList[index + 1].travel_time_in_minutes ? transactionList[index + 1].travel_time_in_minutes + ' mins' : '') + '</p>';
                }

                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Average Travel Time: </b> ' + (item.next_average_travel_time_in_minutes ? item.next_average_travel_time_in_minutes + ' mins' : '') + '</p>';
                marker.content += '<p class="no-margin text-muted padding-left-5"><b>Distance: </b> ' + (item.next_travel_distance_in_km ? item.next_travel_distance_in_km + ' km' : '') + '</p>';

                if (transactionList.length > 1 && index < transactionList.length - 1) {
                    var nextTravelDiff = Math.abs(transactionList[index + 1].travel_time_in_minutes - transactionList[index + 1].average_travel_time_in_minutes);
                    marker.content += '<p class="no-margin text-muted padding-left-5"><b>Difference: </b> ' + (transactionList[index + 1].travel_time_in_minutes && transactionList[index + 1].average_travel_time_in_minutes ? nextTravelDiff.toFixed(2) + ' mins' : '') + '</p>';
                }

                marker.content += '<br>';
            }

            //marker.content += '<br>';

            marker.content += '<p class="no-margin text-muted padding-left-5">(Note: Difference = Average Travel Time vs Actual Travel Time)</p>';
            marker.content += '<br>';


            marker.content += '<label class="text-muted"  style="padding:0.5rem 0 0 0.5rem;"><b>Validation Remarks: </b></label>';
            marker.content += '<textarea class="textarea" id="transaction-remarks-textarea" data-transaction-id="' + item.id + '"rows="2" cols="20" placeholder="Enter validation remarks here...">' + (item.remarks ? item.remarks : '') + '</textarea>'
            marker.content += '<div class="transaction-remarks-textarea-container"><span id="transaction-remarks-textarea-response" class="label label-success"></span></div>';

            if (item.status != 'FRAUD') marker.content += '<button id="mark-fraud-btn" data-transaction-id="' + item.id + '" class="md-button md-raised md-warn">Fraud</button>';
            if (item.status != 'CLEARED') marker.content += '<button id="mark-cleared-btn" data-transaction-id="' + item.id + '" class="md-button md-raised md-default">Cleared</button>';
            if (item.status != 'INVESTIGATING' || !item.status) marker.content += '<button id="mark-investigate-btn" data-transaction-id="' + item.id + '" class="md-button md-raised md-accent">Investigate</button>';

            marker.content += '</div>';

            return marker.content;
        }

        function createContentForInfowindow(item, marker, index) {
            setInfowindowContent(item, marker, index);

            marker.transaction = angular.copy(item);

            gmapServices.addListener(marker, 'click', function() {
                clearMapLabel();

                infowindow.open(gmapServices.map, this);
                infowindow.setContent(this.content);

                showTransactionOnMap(this.transaction, true);
                showNextTransaction(this.transaction);

                $('#fraud-panel md-list.transaction-list md-list-item').removeClass('focused-material-list-item');

                var container = $('body .fraud-list-content'),
                    scrollTo = $('#fraud-panel md-list.transaction-list md-list-item#transaction-' + this.transaction.id);

                scrollTo.addClass('focused-material-list-item');

                var scrollToValue = scrollTo.offset().top - container.offset().top + container.scrollTop();

                container.animate({
                    scrollTop: scrollToValue
                }, 1500);
            });
        }

        function getTransactionWithSameDay(transactionDate) {
            return transactionMarkers.map(function(item) {
                if (item.transaction_date.substring(0, 10) == transactionDate.substring(0, 10)) return item;
            });
        }

        function showNextTransaction(transaction) {
            var sameDateTransactions = getTransactionWithSameDay(transaction.transaction_date);

            if (!sameDateTransactions.length) return;

            var currentIndex = _.findIndex(sameDateTransactions, {
                id: transaction.id
            });

            if (currentIndex === -1) return;

            // next route
            if (currentIndex < sameDateTransactions.length - 1) {
                var nextTransaction = sameDateTransactions[currentIndex + 1];
                // show next transaction
                gmapServices.initializeDirectionsService();
                if (!nextTransactionDirectionsDisplay || !nextTransactionDirectionsDisplay.getMap()) {
                    nextTransactionDirectionsDisplay = gmapServices.initializeIndividualDirectionsRenderer({
                        draggable: false,
                        preserveViewport: true,
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeOpacity: 0.75,
                            strokeColor: '#27ae60',
                            map: gmapServices.map
                        }
                    });
                }

                labels.nextTransaction = {
                    'test': 'test'
                };

                var travelInfo = {
                    distance: transaction.travel_distance_in_km,
                    duration: transaction.travel_time_in_minutes
                };

                calculateAndDisplayRoute(transaction.end_point_latlng, nextTransaction.end_point_latlng, travelInfo, labels.nextTransaction, nextTransactionDirectionsDisplay, 'Next', 'rgba(39, 174, 96, 0.75)')
                    .then(function(label) {
                    labels.nextTransaction = label;
                });
            } else console.log('transaction ' + transaction.id + ' is last transaction of the day.');

            // previous route
            if (currentIndex > 0) {
                var previousTransaction = sameDateTransactions[currentIndex - 1];
                // show next transaction
                gmapServices.initializeDirectionsService();
                if (!previousTransactionDirectionsDisplay || !previousTransactionDirectionsDisplay.getMap()) {
                    previousTransactionDirectionsDisplay = gmapServices.initializeIndividualDirectionsRenderer({
                        draggable: false,
                        preserveViewport: true,
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeOpacity: 0.75,
                            strokeColor: '#f39c12',
                            map: gmapServices.map
                        }
                    });
                }

                labels.previousTransaction = {
                    'test': 'test'
                };

                var travelInfo = {
                    distance: transaction.next_travel_distance_in_km,
                    duration: transaction.next_average_travel_time_in_minutes
                };

                calculateAndDisplayRoute(previousTransaction.end_point_latlng, transaction.end_point_latlng, travelInfo, labels.previousTransaction, previousTransactionDirectionsDisplay, 'Prev', 'rgba(243, 156, 18, 0.75)')
                    .then(function(label) {
                    labels.previousTransaction = label;
                });
            } else console.log('transaction ' + transaction.id + ' is first transaction of the day.');
        }

        function addTransaction(item, isFromFraud, index) {
            var obj = angular.copy(item);

            if (item.end_point_latlng) {
                obj.marker = createMarker(item.end_point_latlng, item, isFromFraud);
            } else if (item.start_point_latlng) {
                obj.marker = createMarker(item.start_point_latlng, item, isFromFraud);
            }

            obj.marker.id = item.id;

            if (obj.marker) createContentForInfowindow(item, obj.marker, index);

            return obj;
        }

        function clearMapLabel() {
            for (var key in labels) {
                if (!_.isEmpty(labels[key]) && labels[key] instanceof google.maps.OverlayView) {
                    labels[key].setMap(null);
                    labels[key] = null;
                }
            }

            inviMarkers.forEach(function(marker) {
                if (marker && marker.getMap()) {
                    marker.setMap(null);
                    marker = null;
                }
            });

            inviMarkers = [];
        }

        function resetTransactionVisuals() {
            if (gmapServices.directionsDisplay) gmapServices.directionsDisplay.setDirections({
                routes: []
            });
            if (previousTransactionDirectionsDisplay) previousTransactionDirectionsDisplay.setDirections({
                routes: []
            });
            if (nextTransactionDirectionsDisplay) nextTransactionDirectionsDisplay.setDirections({
                routes: []
            });

            clearMapLabel();

            if (infowindow) infowindow.close();
        }

        function resetMarkers() {
            resetTransactionVisuals();

            transactionMarkers.forEach(function(obj) {
                if (obj && obj.marker && obj.marker.getMap()) {
                    obj.marker.setMap(null);
                }
            });
            transactionMarkers = [];
        }

        function initMarkers(list, isFromFraud) {
            if (!infowindow) infowindow = gmapServices.createInfoWindow('', {
                zIndex: 1
            });

            transactionList = angular.copy(list);

            transactionMarkers = list.map(function(item, idx) {
                return addTransaction(item, isFromFraud, idx);
            });

            var mapLegendData = getMapLegendData(list);
            $rootScope.$broadcast('compile-map-legend', {
                type: 'transactions',
                data: mapLegendData
            });

            return transactionMarkers;
        }

        function getMapLegendData(list) {
            return _.pluck(_.uniq(list, function(item) {
                return item.status;
            }), 'status').map(function(stat) {
                if (stat) return {
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
                    .then(function(response) {
                    dfd.resolve(response.plain());
                }, function(error) {
                    dfd.reject(error);
                });
            } else { // insert
                SalesTransaction.post(data)
                    .then(function(response) {
                    var resp = response.plain();
                    var transactionItem = addTransaction(resp.sales_transaction);
                    gmapServices.showMarker(transactionItem.marker);
                    transactionMarkers.push(transactionItem);
                    dfd.resolve(resp);
                }, function(error) {
                    dfd.reject(error);
                });
            }

            return dfd.promise;
        }

        function getIconColorByStatus(status) {
            if (!status) return '#95a5a6';

            switch (status.toUpperCase()) {
                case 'CLEARED':
                    return '#2ecc71';
                case 'FRAUD':
                    return '#e74c3c';
                case 'INVESTIGATING':
                    return '#f39c12';
            }
        }

        function getUserTransactions(pageNo, pageSize) {
            var dfd = $q.defer();

            var user = userSessionService.getUserInfo(true);

            if (user) {
                user.getList('salestransactions', {
                    page_no: pageNo,
                    page_size: pageSize
                })
                    .then(function(response) {
                    dfd.resolve(response.plain().map(function(item) {
                        item.icon = transactionTypes[item.type.toUpperCase()];
                        item.icon.color = getIconColorByStatus(item.status);
                        return item;
                    }));
                }, function(error) {
                    dfd.reject(error);
                });
            } else {
                dfd.reject();
            }

            return dfd.promise;
        }

        function getCenterOfRouteResult(routes) {
            var route = routes[0];

            var center = route.overview_path[Math.floor(route.overview_path.length / 2)];

            if (center) return center;

            return route.overview_path[Math.floor(route.overview_path.length / 2 - 1)];
        }

        function calculateAndDisplayRoute(originLatlng, destinationLatLng, travelInfo, customInfoLabel, customDirectionsDisplay, labelStartText, labelBgColor) {
            var dfd = $q.defer();

            gmapServices.directionsService.route({
                origin: originLatlng,
                destination: destinationLatLng,
                travelMode: 'DRIVING'
            }, function(response, status) {
                if (status === 'OK') {
                    if (customDirectionsDisplay) customDirectionsDisplay.setDirections(response);
                    else gmapServices.directionsDisplay.setDirections(response);

                    if (!_.isEmpty(customInfoLabel)) {
                        var contentStr = 'to next transaction';

                        var center = getCenterOfRouteResult(response.routes);

                        var invimarker = gmapServices.initMarker(center, null, {
                            visible: false
                        })

                        if (!travelInfo.distance || !travelInfo.duration) {
                            gmapServices.initializeDistanceMatrix();

                            console.log('CALLINMG DISTANCE MATRIX');

                            gmapServices.distanceMatrix.getDistanceMatrix({
                                origins: [originLatlng],
                                destinations: [destinationLatLng],
                                travelMode: 'DRIVING',
                                newForwardGeocoder: true
                            }, function(response, status) {

                                if (status == 'OK' && response.rows.length && response.rows[0].elements.length) {
                                    contentStr = '';
                                    if (labelStartText) contentStr += labelStartText + ' | ';
                                    contentStr += 'Distance: ' + response.rows[0].elements[0].distance.text;
                                    contentStr += ' | Average Travel Time: ' + response.rows[0].elements[0].duration.text;
                                    customInfoLabel = new Label({
                                        map: gmapServices.map,
                                        text: contentStr,
                                        bgcolor: labelBgColor
                                    });
                                    customInfoLabel.bindTo('position', invimarker, 'position');
                                    inviMarkers.push(invimarker);
                                    dfd.resolve(customInfoLabel);
                                }
                            });
                        } else {
                            contentStr = '';
                            if (labelStartText) contentStr += labelStartText + ' | ';
                            contentStr += 'Distance: ' + travelInfo.distance;
                            contentStr += ' | Average Travel Time: ' + travelInfo.duration;

                            customInfoLabel = new Label({
                                map: gmapServices.map,
                                text: contentStr,
                                bgcolor: labelBgColor
                            });
                            customInfoLabel.bindTo('position', invimarker, 'position');
                            inviMarkers.push(invimarker);
                            dfd.resolve(customInfoLabel);
                        }

                    } else dfd.reject();

                } else {
                    dfd.reject();
                    console.log('Directions request failed due to ' + status);
                }
            });

            return dfd.promise;
        }

        function showTransactionOnMap(transaction, isFromFraud) {
            console.log('showTransactionOnMap: ', transaction);
            if (nextTransactionDirectionsDisplay) nextTransactionDirectionsDisplay.setDirections({
                routes: []
            });
            if (previousTransactionDirectionsDisplay) previousTransactionDirectionsDisplay.setDirections({
                routes: []
            });

            if (!transaction.start_point_latlng && transaction.end_point_latlng && !isFromFraud) {
                // show marker
                if (transactionMarkerItem) {
                    transactionMarkerItem.setMap(null);
                }

                transactionMarkerItem = createMarker(transaction.end_point_latlng, transaction.type);
                transactionMarkerItem.setMap(gmapServices.map);

                gmapServices.setZoomIfGreater(15);
                gmapServices.panTo(transaction.end_point_latlng);
            }
        }

        function showMarkerById(id) {
            var found = _.findWhere(transactionMarkers, {
                id: id
            });
            if (found && found.marker) {
                if (!found.marker.getMap()) found.marker.setMap(gmapServices.map);

                // show infowindow
                gmapServices.triggerEvent(found.marker, 'click');
            }
        }

        return service;
    }
}());