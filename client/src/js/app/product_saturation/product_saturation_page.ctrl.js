(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSaturationPageController', ['$rootScope', 'gmapServices', 'modalServices', 'branchService', productSaturationPageController]);

    function productSaturationPageController ($rootScope, gmapServices, modalServices, branchService) {
        var vm = this;

        $rootScope.showProductSaturationSlider = false;
        vm.showSaturationInfo = false;

        var branchId,
            branchMarker;

        //var drawingManager, overlay;

        initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');

            $('#map-legend').addClass('map-legend-most-right');

            $(document).on('click', '#add-product-branch-btn', function () {
                branchId = $(this).data('branch-id');
                branchMarker = branchService.getBranchById(branchId);

                modalServices.showAddProductToBranch(branchMarker.branch)
                    .then(function(){

                    });
            });

            $rootScope.$on('product-saturation-numbers-update', function(e,params){
               vm.showSaturationInfo = angular.copy(params.data);
            });

            $rootScope.$on('show-product-saturation-slider', function(){
                $rootScope.showProductSaturationSlider = true;
            });


            /* for deletion only on branch, remove after */
            //drawingManager = new google.maps.drawing.DrawingManager({
            //    drawingControl: true,
            //    drawingControlOptions: {
            //        position: google.maps.ControlPosition.TOP_CENTER,
            //        drawingModes: ['polygon']
            //    }
            //});
            //drawingManager.setMap(gmapServices.map);
            //google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
            //    if (overlay) {
            //        overlay.setMap(null);
            //        overlay = null;
            //    }
            //
            //    overlay = event.overlay;
            //    var path = overlay.getPath().getArray().map(function(p){return p.toJSON();});
            //
            //    Branch.customPUT({boundary: path})
            //        .then(function(){
            //            overlay.setMap(null);
            //            overlay = null;
            //        },function(error){console.log('error: ',error);});
            //});
        }

    }
}());