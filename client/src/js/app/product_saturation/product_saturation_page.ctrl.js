(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSaturationPageController', ['gmapServices', 'modalServices', 'branchService', productSaturationPageController]);

    function productSaturationPageController (gmapServices, modalServices, branchService) {
        var vm = this;

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
        }

    }
}());