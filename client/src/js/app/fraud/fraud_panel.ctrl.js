(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPanelController', ['fraudService', 'alertServices', '$timeout', 'modalServices', 'userSessionService', '$mdDateRangePicker', 'salesTransactionService', 'userResourcesService', '$q', fraudPanelController]);

    function fraudPanelController (fraudService, alertServices, $timeout, modalServices, userSessionService, $mdDateRangePicker, salesTransactionService, userResourcesService, $q) {
        var vm = this;

        vm.listOfDays = [];
        vm.dataIsLoaded = true;

        vm.filter = {
            empId: null
        };

        vm.employeeList = [];
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

        var sampleDataStartDate = new Date(2017, 1, 8),
            sampleDataEndDate = new Date(2017, 1, 10);

        vm.uploadHasResponse = true;
        vm.frauds = [];

        vm.uploadFraudData = uploadFraudData;
        vm.showFraudDetail = showFraudDetail;
        vm.showFraudTransactions = showFraudTransactions;
        vm.pickDateRange = pickDateRange;
        vm.onClickTransaction = onClickTransaction;
        vm.employeeFilterChanged = employeeFilterChanged;
        vm.getTransactionByDate = getTransactionByDate;
        vm.returnToDayList = returnToDayList

        initialize();

        function initialize () {
            var fraudData = userSessionService.getFraudData();
            if (fraudData) {
                vm.frauds = fraudService.showFraudDataOnMap(fraudData);
            }

            vm.selectedRange.dateStart = sampleDataStartDate;
            vm.selectedRange.dateEnd = sampleDataEndDate;

            userResourcesService.getEmployees()
                .then(function(list){
                    vm.employeeList = angular.copy(list);

                    $timeout(function(){
                        vm.filter.empId = '2';

                        $timeout(function () {
                            setDateGetData(vm.selectedRange.dateStart, vm.selectedRange.dateEnd);
                            getArrayOfDateFromRange(vm.selectedRange.dateStart, vm.selectedRange.dateEnd)
                                .then(function (list) {
                                    vm.listOfDays = list;

                                    getSalesTransactions();
                                });
                        }, 500);
                    }, 1000);
                });
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

            vm.transactions = [];
            salesTransactionService.resetMarkers();

            fraudService.getTransactionsWithinDateRange(vm.selectedDate.start, vm.selectedDate.end, vm.filter.empId)
                .then(function(list){
                   vm.transactions = angular.copy(list);
                    salesTransactionService.initMarkers(list, true);
                }).finally(function(){
                    vm.dataIsLoaded = true;
                });
        }

        function setDateGetData (dateStart, dateEnd) {
            vm.selectedDate = {};

            var momentDateStart = moment(dateStart);
            var dateStartStr = momentDateStart.format('MMM D, YYYY');

            vm.selectedDate.start = momentDateStart.format('YYYY-MM-DD');

            var dateEndStr;

            if (dateEnd) {
                var momentDateEnd = moment(dateEnd);
                dateEndStr = momentDateEnd.format('MMM D, YYYY');
                vm.selectedDate.end = momentDateEnd.format('YYYY-MM-DD');
            }

            vm.selectedDate.formatted = dateStart && dateEnd
                                        ? dateStartStr + ' - ' + dateEndStr
                                        : dateStartStr;

        }

        function getArrayOfDateFromRange (dateStart, dateEnd) {
            var dfd = $q.defer();
            //console.log('getArrayOfDateFromRange', dateStart, dateEnd);
            var dateArray = [];

            while(dateStart <= dateEnd) {
                dateArray.push({
                    date: dateStart,
                    date_formatted: moment(dateStart).format('ddd MMM D, YYYY'),
                    date_param: moment(dateStart).format('YYYY-MM-DD')
                });
                dateStart = dateStart.addDays(1);
            }

            fraudService.getDaysWithTransactionsCount(dateArray.map(function(item){return item.date_param;}), vm.filter.empId)
                .then(function(list){
                    var idx;

                    dateArray.forEach(function(dateItm, listIndex){
                        idx = _.findIndex(list, {date_param: dateItm.date_param});
                        if (idx > -1) dateArray[listIndex]['count'] = list[idx].count;
                    });

                    console.log('finalresult: ', dateArray);

                    dfd.resolve(dateArray);

                }, function (error){
                    dfd.reject(error);
                });

            //return dateArray;

            return dfd.promise;
        }

        function showResult (result) {
            listOfDaysTemp = [];
            vm.listOfDays = [];

            vm.selectedRange = result;

            if (vm.selectedRange.dateStart == vm.selectedRange.dateEnd) {
                //console.log('range is same day');
                setDateGetData(vm.selectedRange.dateStart);
            } else {
                setDateGetData(vm.selectedRange.dateStart, vm.selectedRange.dateEnd);
                getArrayOfDateFromRange(vm.selectedRange.dateStart, vm.selectedRange.dateEnd)
                    .then(function(list){
                        vm.listOfDays = list;
                    });
            }

            getSalesTransactions();
        }

        function pickDateRange($event, showTemplate) {
            vm.selectedRange.showTemplate = showTemplate;

            $mdDateRangePicker.show({
                targetEvent: $event,
                model: vm.selectedRange
            }).then(function (result) {
                if (result) showResult(result);
            })
        }

        function onClickTransaction (item) {
            salesTransactionService.showMarkerById(item.id);
        }

        var listOfDaysTemp = [];

        function employeeFilterChanged () {
            //console.log('employeeFilterChanged');
            getSalesTransactions();
        }

        function getTransactionByDate (dateItem) {
            //console.log('getTransactionByDate: ', dateItem);

            setDateGetData(dateItem.date);

            listOfDaysTemp = angular.copy(vm.listOfDays);
            vm.listOfDays = [];

            getSalesTransactions();
        }

        function returnToDayList () {
            salesTransactionService.resetTransactionVisuals();
            if (listOfDaysTemp.length) vm.listOfDays = angular.copy(listOfDaysTemp);
        }

    }
}());