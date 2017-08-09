(function(){
'use strict';

angular.module('demoApp')
    .factory('userResourcesService', ['$q', 'userSessionService', 'User', userResourcesService]);

    function userResourcesService ($q, userSessionService, User) {
        var service = {};

        var transactionTypes = {
            'CLIENT VISIT': 'store',
            'GAS': 'local_gas_station',
            'FLIGHT': 'flight_takeoff',
            'COVERAGE': 'flag',
            '1SS': 'local_atm',
            'C3S': 'crdit_card',
            'IIDACS': 'finance',
            'FLEET': 'local_taxi'
        };

        service.getUserTransactions = getUserTransactions;
        service.getEmployees = getEmployees;
        service.getUserTerritories = getUserTerritories;

        function getEmployees () {
            var dfd = $q.defer();

            User.getList({roleid: 2})
                .then(function(response){
                    dfd.resolve(response.plain().map(function(emp){
                        emp.name = emp.lastname.capitalize() + ', ' + emp.firstname.capitalize();
                        return emp;
                    }));
                }, function(error){
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function getUserTransactions () {
            var dfd = $q.defer();

            var user = userSessionService.getUserInfo();

            if (user) {
                User.cast(user.id)
                    .getList('salestransactions')
                        .then(function(response){
                            dfd.resolve(response.plain().map(function(item){
                                item.icon = transactionTypes[item.type.toUpperCase()];
                                return item;
                            }));
                        }, function(error){
                            dfd.reject(error);
                        });
            } else {
                dfd.reject();
            }

            return dfd.promise;
        }

        function getUserTerritories (userId) {
            var dfd = $q.defer();

            User.cast(userId).getList('territories')
                .then(function (response) {
                    dfd.resolve(response.plain());
                }, function (error) {
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        return service;
    }
}());