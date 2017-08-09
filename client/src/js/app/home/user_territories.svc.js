(function(){
'use strict';

angular.module('demoApp.home')
    .factory('userTerritoriesService', ['$q', 'userSessionService', 'Territory', 'gmapServices', userTerritoriesService]);

    function userTerritoriesService ($q, userSessionService, Territory, gmapServices) {
        var service = {};

        var abort;

        var polygonColor = '#3f51b5';

        service.getTerritories = getTerritories;
        service.getTerritoryBranches = getTerritoryBranches;
        service.showTerritoryPolygon = showTerritoryPolygon;

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

        function showTerritoryPolygon(latlngArray) {
            return gmapServices.createPolygon(latlngArray, polygonColor);
        }

        return service;
    }
}());