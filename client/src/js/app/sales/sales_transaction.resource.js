(function () {
    'use strict';

    angular.module('demoApp.sales')
        .factory('SalesTransaction', ['Restangular', SalesTransaction]);

    function SalesTransaction(Restangular) {
        var myModel = Restangular.all('salestransactions');

        var resource = {
            cast: function (myid) {
                return Restangular.restangularizeElement(null, {id: myid}, 'salestransactions');
            }
        };

        Restangular.extendModel('salestransactions', function (model) {
            return model;
        });

        angular.merge(myModel, resource);

        return myModel;
    }
}());