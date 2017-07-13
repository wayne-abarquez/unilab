(function(){
'use strict';

angular.module('demoApp')
    .factory('userResourcesService', ['$q', 'userSessionService', 'User', userResourcesService]);

    function userResourcesService ($q, userSessionService, User) {
        var service = {};

        var transactionTypes = {
            'CLIENT VISIT': 'store',
            'GAS': 'local_gas_station',
            'FLIGHT': 'flight_takeoff'
        };

        service.getUserTransactions = getUserTransactions;

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

        return service;
    }
}());