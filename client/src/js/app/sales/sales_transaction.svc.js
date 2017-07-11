(function(){
'use strict';

angular.module('demoApp.sales')
    .factory('salesTransactionService', ['SalesTransaction', '$q', salesTransactionService]);

    function salesTransactionService (SalesTransaction, $q) {
        var service = {};

        service.saveTransaction = saveTransaction;

        function saveTransaction(data, id) {
            var dfd = $q.defer();

            if (id) { // update
                var restObj = SalesTransaction.cast(id);
                restObj.customPUT(data)
                    .then(function (response) {
                        dfd.resolve(response.plain());
                    }, function (error) {
                        dfd.reject(error);
                    });
            } else { // insert
                SalesTransaction.post(data)
                    .then(function (response) {
                        dfd.resolve(response.plain());
                    }, function (error) {
                        dfd.reject(error);
                    });
            }

            return dfd.promise;
        }

        return service;
    }
}());