(function(){
'use strict';

angular.module('demoApp')
    .factory('boundariesService', ['Boundary', '$q', boundariesService]);

    function boundariesService (Boundary, $q) {
        var service = {};

        service.boundaries = [];

        service.loadBoundaries = loadBoundaries;
        service.getRestangularObj = getRestangularObj;

        function loadBoundaries(parentid) {
            var dfd = $q.defer();

            Boundary.customGET(null, {parent_id: parentid || null})
                .then(function (list) {
                    //console.log('load boundaries: ', list);
                    service.boundaries = list.plain().map(function (item) {
                        item['isExpanded'] = false;
                        return item;
                    });

                    dfd.resolve(list.plain());
                }, function (error) {
                    console.log('failed to load: ', error);
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function getRestangularObj (boundaryId) {
            return Boundary.cast(boundaryId);
        }

        return service;
    }
}());