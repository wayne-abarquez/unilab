(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSatPanelController', ['modalServices', productSatPanelController]);

    function productSatPanelController (modalServices) {
        var vm = this;

        vm.newProduct = newProduct;

        initialize();

        function initialize () {

        }

        function newProduct (event) {
            modalServices.showNewProductForm(event)
                .then(function(product){

                });
        }
    }
}());