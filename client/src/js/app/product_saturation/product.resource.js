(function () {
    'use strict';

    angular.module('demoApp.productSaturation')
        .factory('Product', ['Restangular', Product]);

    function Product(Restangular) {
        var myModel = Restangular.all('products');

        var resource = {
            cast: function (myid) {
                return Restangular.restangularizeElement(null, {id: myid}, 'products');
            }
        };

        angular.merge(myModel, resource);

        return myModel;
    }
}());