(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('newProductController', ['productSatService', 'formHelperService', 'modalServices', 'alertServices', newProductController]);

    function newProductController (productSatService, formHelperService, modalServices, alertServices) {
        var vm = this;

        vm.form = {};

        vm.maxDate = new Date();

        vm.productTypes = [];

        vm.product = {};

        vm.save = save;
        vm.close = close;

        initialize();
        
        function initialize () {
            productSatService.getProductTypes()
                .then(function(types){
                   vm.productTypes = angular.copy(types);
                });
        }

        function save() {
            if (!vm.form.$valid) {
                formHelperService.showFormErrors(vm.form.$error);
                return;
            }

            var formData = angular.copy(vm.product);
            //console.log('save product form data: ', formData);

            productSatService.saveProduct(formData)
                .then(function(response){
                    alertServices.showSuccess('New Product saved.');
                    modalServices.hideResolveModal(response);
                }, function(error){
                    console.log('save product error: ', error);
                    // show errors
                    alertServices.showError(formHelperService.getFormattedErrors(error.data));
                });
        }

        function close() {
            modalServices.closeModal();
        }
    }
}());