(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('newBranchController', ['param', '$scope', '$rootScope', 'BRANCH_TYPES', 'MARKER_BASE_URL', 'modalServices', 'alertServices', 'gmapServices', 'formHelperService', '$timeout', 'branchService', newBranchController]);

    function newBranchController (param, $scope, $rootScope, BRANCH_TYPES, MARKER_BASE_URL, modalServices, alertServices, gmapServices, formHelperService, $timeout, branchService) {
        var vm = this;

        var result;

        var plotMarker,
            markerUrl = MARKER_BASE_URL + 'default-marker.png',
            dragendListener;

        vm.branchTypes = BRANCH_TYPES;
        vm.maxDate = new Date();

        vm.form = {};
        vm.branch = {};

        vm.save = save;
        vm.setLocation = setLocation;
        vm.close = close;

        initialize();

        function initialize () {
            if (param && param.result) {
                result = angular.copy(param.result);

                plotMarker = createPlotMarker(result.geometry.location);
                gmapServices.setZoomIfGreater(14);

                alertServices.showBottomLeftToast('Drag marker to point exact location.', 10000);

                vm.branch.address = result.formatted_address;
                vm.branch.latlng = result.geometry.location.toJSON();
            }

            $rootScope.$on('search-address-return-result', function (e, params) {
                vm.branch.address = params.result.formatted_address;
                setPlotMarkerLocation(params.result.geometry.location);
            });

            $scope.$on('$destroy', function () {
                cleanUp();
            });
        }

        function cleanUp () {
            if (dragendListener) {
                gmapServices.removeListener(dragendListener);
            }

            if (plotMarker && plotMarker.getMap()) {
                plotMarker.setMap(null);
                plotMarker = null;
            }
        }

        function createPlotMarker (latlng) {
            var marker = gmapServices.initMarker(latlng, markerUrl, {draggable: true});

            dragendListener = gmapServices.addListener(marker, 'dragend', function(e) {
                // reverse geocode latlng
                gmapServices.reverseGeocode(e.latLng)
                    .then(function(result){
                        if (result.length) vm.branch.address = result[0].formatted_address;
                    });
            });

            return marker;
        }

        function setPlotMarkerLocation(latlng) {
            gmapServices.panTo(latlng);

            if (plotMarker && plotMarker.getMap()) {
                plotMarker.setOptions({
                    visible: true,
                    animation: google.maps.Animation.DROP,
                    position: latlng
                });
            }
        }

        function getFormData () {
            var date = formHelperService.getDateFormatted(vm.branch.operation_started_date);

            var formData = angular.copy(vm.branch);
            formData.operation_started_date = date;
            formData.latlng = plotMarker.getPosition().toJSON();

            return formData;
        }

        function save () {
            if (!vm.form.$valid) {
                formHelperService.showFormErrors(vm.form.$error);
                return;
            }

            //console.log('branch: ', vm.branch);

            var formData = getFormData();

            // process send to backend
            //console.log('formData: ', formData);

            branchService.saveBranch(formData)
                .then(function(response){
                    //console.log('save branch: ',response);
                    alertServices.showSuccess('New Branch saved.');
                    modalServices.hideResolveModal(response);
                },function(error){
                    console.log('save branch error: ', error);
                    // show errors
                    alertServices.showError(formHelperService.getFormattedErrors(error.data));
                })
                .finally(function(){
                    // hide spinner
                });
        }

        function setLocation () {
            $('#index-container .md-dialog-container').hide();
            plotMarker.setVisible(false);
            gmapServices.setMapCursorCrosshair();

            var mapClickListener = gmapServices.addMapListener('click', function(e){
                $('#index-container .md-dialog-container').show();
                gmapServices.setMapCursorDefault();
                gmapServices.removeListener(mapClickListener);

                $timeout(function(){
                    setPlotMarkerLocation(e.latLng);
                }, 500);
            });
        }

        function close () {
            modalServices.closeModal();
        }
    }
}());