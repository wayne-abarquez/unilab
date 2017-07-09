(function(){
'use strict';

angular.module('demoApp.home')
    .factory('userTerritoriesService', ['$q', '$rootScope', 'userSessionService', 'Territory', userTerritoriesService]);

    function userTerritoriesService ($q, $rootScope, userSessionService, Territory) {
        var service = {};

        service.getTerritories = getTerritories;
        service.getTerritoryBranches = getTerritoryBranches;

        function getTerritories () {
            var dfd = $q.defer();

            var currentUser = userSessionService.getUserInfo(true);

            currentUser.getList('territories')
                .then(function(response){
                    //console.log('get user territories: ',response.plain());
                    dfd.resolve(response.plain());
                }, function(error){
                    console.log('get user territories error: ', error);
                    dfd.reject(error);
                })

            return dfd.promise;
        }

        function getTerritoryBranches (territoryId) {
           var dfd = $q.defer();

            Territory.cast(territoryId)
               .getList('branches')
                    .then(function (response) {
                        //console.log('response: ', response.plain());
                        dfd.resolve(response.plain());
                    }, function (error) {
                        console.log('error: ', error);
                        dfd.reject(error);
                    });

            return dfd.promise;
        }

        return service;
    }
}());