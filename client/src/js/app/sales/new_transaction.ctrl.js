(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('newTransactionController', ['param', '$scope', 'SALES_TRANSACTION_TYPES', 'MARKER_BASE_URL', 'modalServices', 'alertServices', 'gmapServices', 'formHelperService', '$timeout', 'salesTransactionService', newTransactionController]);

    function newTransactionController (param, $scope, SALES_TRANSACTION_TYPES, MARKER_BASE_URL, modalServices, alertServices, gmapServices, formHelperService, $timeout, salesTransactionService) {
        var vm = this;

        var result;
        var autocompleteResult

        var markers = {
          start: {
              marker: null,
              icon: MARKER_BASE_URL + 'start.png',
              dragendListener: null
          },
          end: {
              marker: null,
              icon: MARKER_BASE_URL + 'end.png',
              dragendListener: null
          }
        };

        var autocompletes = {
            start: {
                autocomplete: null,
                id: 'filter-starting-address-input',
                callback : null
            },
            end: {
                autocomplete: null,
                id: 'filter-destination-address-input',
                callback: null
            }
        };

        vm.transactionTypes = SALES_TRANSACTION_TYPES;
        vm.maxDate = new Date();

        vm.form = {};
        vm.transaction = {};

        vm.save = save;
        vm.close = close;

        initialize();

        function initialize () {
            if (param && param.result) {
                result = angular.copy(param.result);

                gmapServices.setZoomIfGreater(14);

                alertServices.showBottomLeftToast('Drag marker to point exact location.', 10000);

                vm.transaction.address = result.formatted_address;
                vm.transaction.end_point_address = result.formatted_address;
                createDestinationPointMarker(result.geometry.location);
            }

            gmapServices.initializeDirectionsService();
            gmapServices.initializeDirectionsRenderer({draggable: true});

            $timeout(function(){
                initializeAutocompletes();
            }, 1000);

            $scope.$watch(function(){
                return vm.transaction.start_point_latlng;
            }, function (newValue, oldValue) {
                if (newValue === oldValue) return;

               if (newValue && vm.transaction.end_point_latlng) {
                   calculateAndDisplayRoute(newValue, vm.transaction.end_point_latlng);
               }
            });

            $scope.$watch(function () {
                return vm.transaction.end_point_latlng;
            }, function (newValue, oldValue) {
                if (newValue === oldValue) return;

                if (newValue && vm.transaction.start_point_latlng) {
                    calculateAndDisplayRoute(vm.transaction.start_point_latlng, newValue);
                }
            });

            $scope.$on('$destroy', function () {
                cleanUp();
            });
        }

        function cleanUp() {
            vm.transaction = null;

            gmapServices.directionsService = null;
            gmapServices.directionsDisplay.setMap(null);
            gmapServices.directionsDisplay = null;

            for (var k in markers) {
                if (markers[k].marker && markers[k].marker.getMap()) {
                    markers[k].marker.setMap(null);
                    markers[k].marker = null;
                }
                if (markers[k].dragendListener) {
                    gmapServices.removeListener(markers[k].dragendListener);
                }
            }
        }

        function calculateAndDisplayRoute(originLatlng, destinationLatLng) {
            if (!gmapServices.directionsService || !gmapServices.directionsDisplay) return;

            gmapServices.directionsService.route({
                origin: originLatlng,
                destination: destinationLatLng,
                travelMode: 'DRIVING'
            }, function (response, status) {
                console.log('calculateAndDisplayRoute response: ', response);
                if (status === 'OK') {
                    gmapServices.directionsDisplay.setDirections(response);
                } else {
                    alertServices.showError('Directions request failed due to ' + status);
                }
            });
        }

        function placeChangeCallback(autocompleteObj) {
            var place = autocompleteObj.getPlace();

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

            return place;
        }

        function createStartPointMarker (latlng) {
            markers.start.marker = gmapServices.initMarker(latlng, markers.start.icon, {draggable: true});
            vm.transaction.start_point_latlng = latlng.toJSON();

            markers.start.dragendListener = gmapServices.addListener(markers.start.marker, 'dragend', function (e) {
                vm.transaction.start_point_latlng = e.latLng.toJSON();
                // reverse geocode latlng
                gmapServices.reverseGeocode(e.latLng)
                    .then(function (result) {
                        if (result.length) vm.transaction.start_point_address = result[0].formatted_address;
                    });
            });
            return markers.start.marker;
        }

        function createDestinationPointMarker(latlng) {
            markers.end.marker = gmapServices.initMarker(latlng, markers.end.icon, {draggable: true});
            vm.transaction.end_point_latlng = latlng.toJSON();

            markers.end.dragendListener = gmapServices.addListener(markers.end.marker, 'dragend', function (e) {
                vm.transaction.end_point_latlng = e.latLng.toJSON();
                // reverse geocode latlng
                gmapServices.reverseGeocode(e.latLng)
                    .then(function (result) {
                        if (result.length) {
                            vm.transaction.end_point_address = result[0].formatted_address;
                            vm.transaction.address = result[0].formatted_address;
                        }
                    });
            });
            return markers.end.marker;
        }

        function setPlotMarkerLocation(latlng, markerInstance) {
            gmapServices.panTo(latlng);

            if (markerInstance && markerInstance.getMap()) {
                markerInstance.setOptions({
                    visible: true,
                    animation: google.maps.Animation.DROP,
                    position: latlng
                });
            }
        }

        function initializeAutocompletes () {
            autocompletes.start.callback = function () {
                autocompleteResult = placeChangeCallback(autocompletes.start.autocomplete);
                if (!markers.start.marker) createStartPointMarker(autocompleteResult.geometry.location);
                else setPlotMarkerLocation(autocompleteResult.geometry.location, markers.start.marker);
            };

            autocompletes.end.callback = function () {
                autocompleteResult = placeChangeCallback(autocompletes.end.autocomplete);

                if (!markers.end.marker) createDestinationPointMarker(autocompleteResult.geometry.location);
                else setPlotMarkerLocation(autocompleteResult.geometry.location, markers.end.marker);

                $scope.$apply(function () {
                    vm.transaction.address = angular.copy(autocompleteResult.formatted_address);
                });
            };

            for (var k in autocompletes) {
                autocompletes[k].autocomplete = gmapServices.initializeAutocomplete(autocompletes[k].id, {
                    componentRestrictions: {country: 'ph'}
                });
                autocompletes[k].autocomplete.addListener('place_changed', autocompletes[k].callback);
            }
        }

        function getFormData() {
            var formData = angular.copy(vm.transaction);

            formData.start_point_latlng = markers.start.marker.getPosition().toJSON();
            formData.end_point_latlng = markers.end.marker.getPosition().toJSON();

            return formData;
        }

        function save() {
            if (!vm.form.$valid) {
                formHelperService.showFormErrors(vm.form.$error);
                return;
            }

            if (!markers.start.marker) {
                vm.transaction.start_point_address = '';
                return;
            } else if (!markers.end.marker) {
                vm.transaction.end_point_address = '';
                return;
            }

            console.log('save transaction: ', vm.transaction);
            var formData = getFormData();
            console.log('formData: ', formData);

            // process send to backend
            salesTransactionService.saveTransaction(formData)
                .then(function (response) {
                    //console.log('save sales transaction: ',response);
                    alertServices.showSuccess('Transaction saved.');
                    modalServices.hideResolveModal(response);
                }, function (error) {
                    // show errors
                    alertServices.showError(formHelperService.getFormattedErrors(error.data));
                })
                .finally(function () {
                    // hide spinner
                });
        }

        function close () {
            modalServices.closeModal();
        }
    }
}());