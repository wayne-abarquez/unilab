(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .factory('productSatService', ['Product', '$q', productSatService]);

    function productSatService (Product, $q) {
        var service = {};

        service.products = [];

        service.getProducts = getProducts;
        service.getProductTypes = getProductTypes;
        service.saveProduct = saveProduct;
        service.getFiveWeeksDuration = getFiveWeeksDuration;

        function getProducts () {
            var dfd = $q.defer();

            Product.getList()
                .then(function (response) {
                    dfd.resolve(response.plain());
                }, function (error) {
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function getProductTypes () {
            var dfd = $q.defer();

            Product.all('types')
                .getList()
                .then(function(list){
                   var types = _.pluck(list.plain(), 'type');
                    dfd.resolve(types);
                }, function(error){
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function saveProduct (data, id) {
            var dfd = $q.defer();

            if (id) { // update
                Product.cast(id)
                    .customPUT(data)
                    .then(function (response) {
                        dfd.resolve(response.plain());
                    }, function (error) {
                        dfd.reject(error);
                    });
            } else { // insert
                Product.post(data)
                    .then(function (response) {
                        var resp = response.plain();
                        console.log('post product ', resp);
                        dfd.resolve(resp);
                    }, function (error) {
                        dfd.reject(error);
                    });
            }

            return dfd.promise;
        }

        function getFiveWeeksDuration (date) {
            var result = [];
            var currentMomentData = moment(date);
            var formatDate = 'YYYY-MM-DD',
                formatDateHuman = 'dddd, MMMM Do YYYY';

            result.push({
                week: 0,
                weekRangeStart: currentMomentData.startOf('week').format(formatDate),
                weekRangeEnd: currentMomentData.endOf('week').format(formatDate),
                weekRangeStartFormatted: currentMomentData.startOf('week').format(formatDateHuman),
                weekRangeEndFormatted: currentMomentData.endOf('week').format(formatDateHuman)
            });

            for (var i=1; i<5; i++) {
                currentMomentData = currentMomentData.endOf('week').add(1, 'days');
                result.push({
                    week: i,
                    weekRangeStart: currentMomentData.startOf('week').format(formatDate),
                    weekRangeEnd: currentMomentData.endOf('week').format(formatDate),
                    weekRangeStartFormatted: currentMomentData.startOf('week').format(formatDateHuman),
                    weekRangeEndFormatted: currentMomentData.endOf('week').format(formatDateHuman)
                });
            }

            return result;
        }

        return service;
    }
}());