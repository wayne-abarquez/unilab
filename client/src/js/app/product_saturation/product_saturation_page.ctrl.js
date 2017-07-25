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

        initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');

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
        }

    }
}());