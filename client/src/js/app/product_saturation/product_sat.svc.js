(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .factory('productSatService', ['Product', '$q', productSatService]);

    function productSatService (Product, $q) {
        var service = {};

        service.products = [];

        service.getProductTypes = getProductTypes;
        service.saveProduct = saveProduct;

        function getProductTypes () {
            var dfd = $q.defer();

            Product.all('types')
                .getList()
                .then(function(list){
                   var types = _.pluck(list.plain(), 'type');
                    dfd.resolve(types);
                }, function(error){
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function saveProduct (data, id) {
            var dfd = $q.defer();

            if (id) { // update
                Product.cast(id)
                    .customPUT(data)
                    .then(function (response) {
                        dfd.resolve(response.plain());
                    }, function (error) {
                        dfd.reject(error);
                    });
            } else { // insert
                Product.post(data)
                    .then(function (response) {
                        var resp = response.plain();
                        console.log('post product ', resp);
                        dfd.resolve(resp);
                    }, function (error) {
                        dfd.reject(error);
                    });
            }

            return dfd.promise;
        }

        return service;
    }
}());