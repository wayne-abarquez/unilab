(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('addProductToBranchController', ['branch', 'productSatService', 'modalServices', 'alertServices', addProductToBranchController]);

    function addProductToBranchController (branch, productSatService, modalServices, alertServices) {
        var vm = this;

        vm.tableHeading = ['name', 'type', 'cost', 'remarks'];

        vm.selectedProduct = [];

        vm.branch = {};

        vm.productTypes = [''];

        vm.products = [];

        vm.addProduct = addProduct;
        vm.save = save;
        vm.close = close;

        initialize();
        
        function initialize () {
            vm.branch = angular.copy(branch);


            productSatService.getProductTypes()
                .then(function(types){
                    vm.productTypes = vm.productTypes.concat(types);
                });

            productSatService.getProducts()
                .then(function(list){
                    vm.products = angular.copy(list.map(function(item){
                        item.added = false;
                        return item;
                    }));
                });
        }

        function addProduct (item) {
            var index = vm.selectedProduct.indexOf(item.id);

            if (index > -1) {
                vm.selectedProduct.splice(index, 1);
                return;
            }

            item.added = true;
            vm.selectedProduct.push(item.id);
        }

        function save() {
        }

        function close() {
            modalServices.closeModal();
        }
    }
}());