(function(){
'use strict';

angular.module('demoApp.fraud')
    .factory('fraudService', ['$q', 'MARKER_BASE_URL', 'Fraud', 'gmapServices', 'SalesTransaction', 'salesTransactionService', 'COVERAGE_DATA', fraudService]);

    function fraudService ($q, MARKER_BASE_URL, Fraud, gmapServices, SalesTransaction, salesTransactionService, COVERAGE_DATA) {
        var service = {};

        var fraudMarkerUrl = MARKER_BASE_URL + 'fraud.png';
        var fraudMarkers = [],
            fraudInfowindow;

        service.uploadEmployeeData = uploadEmployeeData;
        service.showFraudDataOnMap = showFraudDataOnMap;
        service.showMarker = showMarker;
        service.getTransactionsWithinDateRange = getTransactionsWithinDateRange;
        service.getDaysWithTransactionsCount = getDaysWithTransactionsCount;
        service.getSampleData = getSampleData;

        function uploadEmployeeData (file) {
            var dfd = $q.defer();

            if (!file) {
                dfd.reject();
            } else {
                file.upload = Fraud.uploadEmployeeData(file);

                file.upload.then(function (response) {
                        file.result = response.data;
                        dfd.resolve(response.data);
                }, function (error) {
                    dfd.reject(error);
                }, function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));

                });
            }

            return dfd.promise;
        }

        function showFraudDataOnMap (list) {
            if (!fraudInfowindow) fraudInfowindow = gmapServices.createInfoWindow('', {pixelOffset: new google.maps.Size(0, 20)});

            var marker;

            // TODO: need to fix date and time before to add on info
            var except = ['latlng'];

            list.forEach(function(item, idx){
               if (item.latlng) {
                   marker = gmapServices.initMarker(
                       item.latlng,
                       fraudMarkerUrl
                   );

                   marker.content = '<div>';
                   for (var k in item) {
                       if (except.indexOf(k) === -1) {
                           marker.content += '<p style="margin:0;padding:0;"><b>' + k.capitalize() + '</b> : ' + (item[k] ? item[k] : '') + '</p>';
                       }

                       if (k.indexOf('address') > -1) {
                           item['merchant_address'] = angular.copy(item[k]);
                           delete item[k];
                       } else if(k.indexOf('station') > -1) {
                           item['merchant_name'] = angular.copy(item[k]);
                           delete item[k];
                       } else if(k == 'transaction type') {
                           item['type'] = angular.copy(item[k])
                           delete item[k];
                       }
                   }
                   marker.content += '</div>';

                   marker.id = idx;
                   marker.data = angular.copy(item);

                   gmapServices.addListener(marker, 'click', function () {
                       fraudInfowindow.open(gmapServices.map, this);
                       fraudInfowindow.setContent(this.content);
                   });

                   fraudMarkers.push(marker);
               }
            });

            return fraudMarkers;
        }

        function showMarker (id) {
            var found = _.findWhere(fraudMarkers, {id: id});
            if (found) {
                if (!found.getMap()) found.setMap(gmapServices.map);

                gmapServices.setZoomIfGreater(14);
                gmapServices.panToMarker(found);

                // show infowindow
                gmapServices.triggerEvent(found, 'click');
            }
        }

        function getTransactionsWithinDateRange(dateStart, dateEnd, empId) {
            console.log('getTransactionsWithinDateRange: ', dateStart, dateEnd, empId);
            var dfd = $q.defer();

            var dateMoment;

            SalesTransaction.getList({'start_date': dateStart, 'end_date': dateEnd, 'emp_id': empId})
                .then(function (response) {
                    var result = response.plain().map(function (item) {
                        dateMoment = moment(item.transaction_date);
                        item.transaction_date_formatted = dateMoment.format('dddd, MMMM DD, YYYY h:mm:ss A');
                        item.icon = salesTransactionService.getIconByType(item.type);
                        return item;
                    });
                    dfd.resolve(result);
                }, function (error) {
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function getDaysWithTransactionsCount (datesArray, empId) {
            var dfd = $q.defer();

            SalesTransaction.customPUT({'dates': datesArray.join('|'), 'emp_id': empId})
                .then(function(response){
                    //var result = response.plain().map(function (item) {
                    //    dateMoment = moment(item.transaction_date);
                    //    item.transaction_date_formatted = dateMoment.format('dddd, MMMM DD, YYYY h:mm:ss A');
                    //    item.icon = salesTransactionService.getIconByType(item.type);
                    //    return item;
                    //});
                    dfd.resolve(response.plain());
                }, function(error){
                    dfd.reject(error);
                });

            return dfd.promise;
        }

        function getSampleData () {
            var data = [];

            return data.concat(COVERAGE_DATA);
        }

        return service;
    }
}());