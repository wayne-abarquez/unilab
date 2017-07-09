(function () {
    'use strict';

    angular.module('demoApp')
        .factory('Boundary', ['Restangular', Boundary]);

    function Boundary(Restangular) {
        var myModel = Restangular.all('boundaries');

        var resource = {
            cast: function (myId) {
                return Restangular.restangularizeElement(null, {id: myId}, 'boundaries');
            }
        };

        Restangular.extendModel('boundaries', function (model) {
            // NOTE: strip restangular removes extra restangular functions on response
            // you can also call plain() function on response if you want want method to be stripped
            //return Restangular.stripRestangular(model);
            return model;
        });

        angular.merge(myModel, resource);

        return myModel;
    }
}());