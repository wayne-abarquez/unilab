(function () {
    'use strict';

    angular.module('demoApp.home')
        .factory('User', ['Restangular', User]);

    function User(Restangular) {
        var myModel = Restangular.all('users');

        var resource = {
            cast: function (userId) {
                return Restangular.restangularizeElement(null, {id: userId}, 'users');
            }
        };

        Restangular.extendModel('users', function (model) {
            // NOTE: strip restangular removes extra restangular functions on response
            // you can also call plain() function on response if you want want method to be stripped
            //return Restangular.stripRestangular(model);
            return model;
        });

        angular.merge(myModel, resource);

        return myModel;
    }
}());