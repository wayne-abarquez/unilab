(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPanelController', ['fraudService', 'alertServices', '$timeout', 'modalServices', 'userSessionService', '$mdDateRangePicker', 'salesTransactionService', fraudPanelController]);

    function fraudPanelController (fraudService, alertServices, $timeout, modalServices, userSessionService, $mdDateRangePicker, salesTransactionService) {
        var vm = this;

        vm.dataIsLoaded = true;

        vm.transactions = [];

        vm.maxDate = new Date();

        vm.selectedDate = {
            formatted: '',
            start: null,
            end: null
        };

        vm.selectedRange = {
            selectedTemplate: 'TW',
            selectedTemplateName: 'This Week',
            dateStart: null,
            dateEnd: null,
            showTemplate: false,
            fullscreen: false,
            disableTemplates: "NW",
            maxRange: new Date(),
            onePanel: true
        };


        vm.uploadHasResponse = true;
        vm.frauds = [];

        vm.uploadFraudData = uploadFraudData;
        vm.showFraudDetail = showFraudDetail;
        vm.showFraudTransactions = showFraudTransactions;
        vm.pickDateRange = pickDateRange;
        vm.onClickTransaction = onClickTransaction;
        vm.openMenu = openMenu;

        initialize();

        function initialize () {
            var fraudData = userSessionService.getFraudData();
            if (fraudData) {
                vm.frauds = fraudService.showFraudDataOnMap(fraudData);
            }

            vm.selectedRange.dateStart = new Date(2017, 1, 6);
            vm.selectedRange.dateEnd = new Date(2017, 1, 10);
            setDateGetData();
            vm.transactions = fraudService.getSampleData();
            salesTransactionService.initMarkers(vm.transactions, true);
        }

        function showFraudTransactions () {
            modalServices.showFraudResult()
                .then(function (datalist) {
                    vm.frauds = fraudService.showFraudDataOnMap(datalist);
                });
        }

        function uploadFraudData(file, errFiles, event) {
            event.stopPropagation();

            if (!file || errFiles.length) {
                alertServices.showError('File is invalid.\nAccepts excel file only.\n .xlsx, .xls');
                return;
            }

            vm.uploadHasResponse = false;
            //fraudService.uploadEmployeeData(file)
            //    .then(function (response) {
            //        console.log('successfully uploaded employee data: ', response);
            $timeout(function(){

                vm.uploadHasResponse = true;

                alertServices.showInfo('Data uploaded. Showing Fraud Report...', true);
                $timeout(function () {
                    modalServices.showFraudResult()
                        .then(function (datalist) {
                            vm.frauds = fraudService.showFraudDataOnMap(datalist);
                        });
                }, 1500);
            }, 3000);

                //}, function (error) {
                //    console.log('error on uploading employee data: ', error);
                //})
                //.finally(function () {
                //    $timeout(function () {
                //        vm.uploadHasResponse = true;
                //    }, 1000);
                //});
        }

        function showFraudDetail(item) {
            fraudService.showMarker(item.id);
        }

        function getSalesTransactions () {
            vm.dataIsLoaded = false;

            fraudService.getTransactionsWithinDateRange(vm.selectedDate.start, vm.selectedDate.end)
                .then(function(list){
                   vm.transactions = angular.copy(list);
                    salesTransactionService.initMarkers(list, true);
                }).finally(function(){
                    vm.dataIsLoaded = true;
                });
        }

        function setDateGetData () {
            var momentDateStart = moment(vm.selectedRange.dateStart),
                momentDateEnd = moment(vm.selectedRange.dateEnd);

            var dateStartStr = momentDateStart.format('MMM D, YYYY'),
                dateEndStr = momentDateEnd.format('MMM D, YYYY');

            vm.selectedDate.formatted = dateStartStr + ' - ' + dateEndStr;
            vm.selectedDate.start = momentDateStart.format('YYYY-MM-DD');
            vm.selectedDate.end = momentDateEnd.format('YYYY-MM-DD');
        }

        function pickDateRange($event, showTemplate) {
            vm.selectedRange.showTemplate = showTemplate;

            $mdDateRangePicker.show({
                targetEvent: $event,
                model: vm.selectedRange
            }).then(function (result) {
                if (result) {
                    vm.selectedRange = result;

                    setDateGetData();

                    getSalesTransactions();


                    //var momentDateStart = moment(vm.selectedRange.dateStart),
                    //    momentDateEnd = moment(vm.selectedRange.dateEnd);
                    //
                    //var dateStartStr = momentDateStart.format('MMM D, YYYY'),
                    //    dateEndStr = momentDateEnd.format('MMM D, YYYY');
                    //
                    //vm.selectedDate.formatted = dateStartStr + ' - ' + dateEndStr;
                    //vm.selectedDate.start = momentDateStart.format('YYYY-MM-DD');
                    //vm.selectedDate.end = momentDateEnd.format('YYYY-MM-DD');

                    getSalesTransactions();
                }
            })
        }

        function onClickTransaction (item) {
            salesTransactionService.showMarkerById(item.id);
        }

        var originatorEv;

        function openMenu(mdMenu, ev) {
            console.log('openMenu', mdMenu, ev);
            //originatorEv = ev;
            //$mdMenu.open(ev);
        }
    }
}());