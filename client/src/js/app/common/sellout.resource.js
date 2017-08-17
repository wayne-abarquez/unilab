(function () {
    'use strict';

    angular.module('demoApp')
        .factory('Sellout', ['Restangular', Sellout]);

    function Sellout(Restangular) {
        var myModel = Restangular.all('sellouts');

        var resource = {
            cast: function (myId) {
                return Restangular.restangularizeElement(null, {id: myId}, 'sellouts');
            }
        };

        Restangular.extendModel('sellouts', function (model) {
            // NOTE: strip restangular removes extra restangular functions on response
            // you can also call plain() function on response if you want want method to be stripped
            //return Restangular.stripRestangular(model);
            return model;
        });

        angular.merge(myModel, resource);

        return myModel;
    }
}());