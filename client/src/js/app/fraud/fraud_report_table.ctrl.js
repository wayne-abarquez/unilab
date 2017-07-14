(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudReportTableController', ['data', 'modalServices', fraudReportTableController]);

    function fraudReportTableController (data, modalServices) {
        var vm = this;

        var visualization;

        vm.viewOnMap = viewOnMap;
        vm.close = close;

        initialize();

        function initialize () {
            console.log('fraudReportTableController data: ',data);

            drawConsolidateData();
            drawExceptions();
        }

        function viewOnMap () {
            modalServices.hideResolveModal();
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

        function drawExceptions() {
            var queryStr = 'https://spreadsheets.google.com/tq?';
            queryStr += 'key=16Fy3dwBGPXg3IgQh63yVZ_4q0zX70GD5H2JGNhn-Imw';

            // second worksheet id
            queryStr += '&gid=585256121';
            queryStr += '&output=html';

            var query = new google.visualization.Query(queryStr);
            query.setQuery('SELECT *');
            query.send(function (response) {
                handleQueryResponse(response, 'exceptions-container');
            });
        }

        function handleQueryResponse(response, elementId) {
            console.log('handleQueryResponse', response);
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
        }

    }
}());