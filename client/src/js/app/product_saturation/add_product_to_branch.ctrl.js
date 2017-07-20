(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('addProductToBranchController', ['branch', 'productSatService', 'modalServices', 'alertServices', addProductToBranchController]);

    function addProductToBranchController (branch, productSatService, modalServices, alertServices) {
        var vm = this;

        vm.branch = {};

        vm.productTypes = [];

        vm.products = [];

        vm.save = save;
        vm.close = close;

        initialize();
        
        function initialize () {
            vm.branch = angular.copy(branch);

            productSatService.getProductTypes()
                .then(function(types){
                   vm.productTypes = angular.copy(types);
                });
        }

        function save() {
        }

        function close() {
            modalServices.closeModal();
        }
    }
}());