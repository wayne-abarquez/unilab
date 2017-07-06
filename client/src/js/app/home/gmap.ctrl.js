(function(){
'use strict';

angular.module('demoApp.home')
    .controller('gmapController', ['gmapServices', gmapController]);

    function gmapController(gmapServices) {

        var vm = this;

        vm.initialize = initialize;

        vm.initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');

            console.log('gmap controller initialized!');
        }

        //function showSolarDetailInfowindow (_solar) {
        //    if(!(_solar && _solar.id)) return;
        //
        //    solarGmapServices.hideSolarMarkers();
        //
        //    var defered = modalServices.showUpdateSolar(_solar, vm, event);
        //    defered.then(function (response) {
        //        console.log('modalServices.showUpdateSolar response:');
        //        console.log(response);
        //
        //            if (!response) return;
        //
        //            solarGmapServices.gmapService.setZoomDefault();
        //            solarGmapServices.showSolarMarkers();
        //
        //            if($rootScope.selectedSolar && response) {
        //                $rootScope.selectedSolar.coordinates = response.coordinates;
        //            }
        //        }, function (errorResponse) {
        //
        //            solarGmapServices.gmapService.setZoomDefault();
        //            solarGmapServices.showSolarMarkers();
        //
        //
        //            console.log('show update solar detail failed');
        //            console.log(errorResponse);
        //        });
        //}
        //
        //
        //function showMarkers () {
        //    solarGmapServices.showSolarMarkers();
        //    solarGmapServices.resetZoom();
        //}

        //function hideMarkers () {
        //    console.log('called from event : modal-opened');
        //    console.log('gmapcontroller hide markers');
        //    solarGmapServices.hideSolarMarkers();
        //    // Hide Solar List Table
        //    $rootScope.showSolarList = false;
        //}
    }
}());