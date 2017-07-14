(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudReportTableController', ['data', 'modalServices', 'gmapServices', '$q', '$interval', 'userSessionService', fraudReportTableController]);

    function fraudReportTableController (data, modalServices, gmapServices, $q, $interval, userSessionService) {
        var vm = this;

        var visualization;

        var exceptionColumns = [];
        var exceptionData = [];

        vm.showOnMapIsLoading = false;

        vm.viewOnMap = viewOnMap;
        vm.close = close;

        initialize();

        function initialize () {
            console.log('fraudReportTableController data: ',data);

            drawConsolidateData();
            drawExceptions();
        }

        function getDataReverseGeocoded () {
            var dfd = $q.defer();
            var list = [];

            var i = 0, item;
            var interval = $interval(function(){
                item = exceptionData[i];

                for (var k in item) {
                    item['latlng'] = null;
                    if (k.indexOf('address') > -1 && item[k]) {
                            gmapServices.geocode(item[k])
                                .then(function (results) {
                                    console.log('geocode response: ', results);
                                    if (results.length) item['latlng'] = results[0].geometry.location.toJSON();
                                }, function (error) {
                                    console.log('error: ', error);
                                });
                    }
                }

                list.push(item);
                i++;

                if (i >= exceptionData.length) {
                    $interval.cancel(interval);
                    interval = null;
                    dfd.resolve(list);
                }
            }, 100);


            return dfd.promise;
        }

        function viewOnMap () {
            vm.showOnMapIsLoading = true;

            var fraudData = userSessionService.getFraudData();

            if (fraudData) {
                modalServices.hideResolveModal(fraudData);
                vm.showOnMapIsLoading = false;
                return;
            }

            getDataReverseGeocoded()
                .then(function(data){
                    userSessionService.saveFraudData(data);
                    modalServices.hideResolveModal(data);
                })
                .finally(function(){
                    vm.showOnMapIsLoading = false;
                });
        }

        function close () {
            modalServices.closeModal();
        }

        function drawConsolidateData() {
            var queryStr = 'https://spreadsheets.google.com/tq?';
                queryStr += 'key=16Fy3dwBGPXg3IgQh63yVZ_4q0zX70GD5H2JGNhn-Imw';
                // first worksheet id
                queryStr += '&gid=956680783';
                queryStr += '&output=html';

            var query = new google.visualization.Query(queryStr);
            query.setQuery('SELECT * WHERE W = "Yes" LIMIT 500');
            query.send(function(response){
                handleQueryResponse(response, 'consolidate-container');
            });
        }

        function getColumnNames (list) {
            return list.map(function(item){
               return item.label.trim().toLowerCase();
            });
        }

        function extractData (list) {
            exceptionData = [];
            var result = [],
                obj,
                col;

            list.forEach(function(item){
                obj = {};
                item.c.forEach(function(itemc, index){
                    col = exceptionColumns[index];
                    obj[col] = itemc && itemc.hasOwnProperty('v')
                                                   ? (itemc.hasOwnProperty('f') ? itemc.f : itemc.v)
                                                   : '';
                });
                result.push(obj);
            });

            return result;
        }

        function drawExceptions() {
            var queryStr = 'https://spreadsheets.google.com/tq?';
            queryStr += 'key=16Fy3dwBGPXg3IgQh63yVZ_4q0zX70GD5H2JGNhn-Imw';

            // second worksheet id
            queryStr += '&gid=585256121';
            queryStr += '&output=html';

            var query = new google.visualization.Query(queryStr);
            query.setQuery('SELECT *');
            query.send(function (response) {
                var data = handleQueryResponse(response, 'exceptions-container');
                exceptionColumns = getColumnNames(data.Mf);
                exceptionData = extractData(data.Nf);

                console.log('exception data: ',exceptionData);
            });
        }

        function handleQueryResponse(response, elementId) {
            console.log('handleQueryResponse '+elementId,response);
            if (response.isError()) {
                alert('There was a problem with your query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                return;
            }

            var data = response.getDataTable();
            console.log('data table: ',data);

            visualization = new google.visualization.Table(document.getElementById(elementId));
            visualization.draw(data, {
                legend: 'top'
            });

            return data;
        }

    }
}());