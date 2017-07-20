(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('addProductToBranchController', ['branch', 'productSatService', 'modalServices', 'alertServices', 'Branch', 'formHelperService', addProductToBranchController]);

    function addProductToBranchController (branch, productSatService, modalServices, alertServices, Branch, formHelperService) {
        var vm = this;

        var branchRest;

        vm.tableHeading = ['name', 'type', 'cost'];

        vm.deliveryDate = null;
        vm.selectedProduct = [];

        vm.branch = {};

        vm.products = [];

        vm.addProduct = addProduct;
        vm.save = save;
        vm.close = close;

        initialize();
        
        function initialize () {
            vm.branch = angular.copy(branch);

            productSatService.getProducts()
                .then(function(list){

                    branchRest = Branch.cast(branch.id);

                    branchRest.getList('products')
                        .then(function (response) {
                            var resp = response.plain();
                            var productIds = _.pluck(resp, 'productid');

                            vm.products = angular.copy(list.map(function (item) {
                                item.added = productIds.indexOf(item.id) > -1;
                                return item;
                            }));

                        });

                });
        }

        function addProduct (item) {
            var index = vm.selectedProduct.indexOf(item.id);

            if (index > -1) {
                //vm.selectedProduct.splice(index, 1);
                //item.added = false;
                return;
            }

            item.added = true;
            vm.selectedProduct.push(item.id);
        }

        function save() {
            var data = {
                'date_released': formHelperService.getDateFormatted(vm.deliveryDate),
                'products': vm.selectedProduct
            };

            console.log('save: ',data);

            branchRest.all('products').post(data)
                .then(function(response){
                    console.log('save products branch: ',response.plain());
                    alertServices.showSuccess('Products added to Branch.');
                    modalServices.hideResolveModal(response.plain());
                });
        }

        function close() {
            modalServices.closeModal();
        }
    }
}());