(function () {
    'use strict';

    angular.module('demoApp.sales')
        .factory('Territory', ['Restangular', Territory]);

    function Territory(Restangular) {
        var myModel = Restangular.all('territories');

        var resource = {
            cast: function (myid) {
                return Restangular.restangularizeElement(null, {id: myid}, 'territories');
            }
        };

        Restangular.extendModel('territories', function (model) {
            return model;
        });

        angular.merge(myModel, resource);

        return myModel;
    }
}());