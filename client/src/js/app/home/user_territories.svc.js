(function(){
'use strict';

angular.module('demoApp.home')
    .factory('userTerritoriesService', ['$q', 'userSessionService', 'Territory', userTerritoriesService]);

    function userTerritoriesService ($q, userSessionService, Territory) {
        var service = {};

        var abort;

        service.getTerritories = getTerritories;
        service.getTerritoryBranches = getTerritoryBranches;

        function getTerritories () {
            var dfd = $q.defer();

            var currentUser = userSessionService.getUserInfo(true);

            currentUser.getList('territories')
                .then(function(response){
                    dfd.resolve(response.plain());
                }, function(error){
                    console.log('get user territories error: ', error);
                    dfd.reject(error);
                })

            return dfd.promise;
        }

        function getTerritoryBranches (territoryId) {
           var dfd = $q.defer();

            if (abort) abort.resolve();

            abort = $q.defer();

            Territory.cast(territoryId)
               .withHttpConfig({timeout: abort})
               .getList('branches')
                    .then(function (response) {
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