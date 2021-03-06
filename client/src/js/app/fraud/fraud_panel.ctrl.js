(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPanelController', ['$rootScope', 'fraudService', 'alertServices', '$timeout', 'modalServices', 'userSessionService', '$mdDateRangePicker', 'salesTransactionService', 'userResourcesService', '$q', 'gmapServices', 'userTerritoriesService', fraudPanelController]);

    function fraudPanelController ($rootScope, fraudService, alertServices, $timeout, modalServices, userSessionService, $mdDateRangePicker, salesTransactionService, userResourcesService, $q, gmapServices, userTerritoriesService) {
        var vm = this;

        var userTerritoryPolygons = [];

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

        //var sampleDataStartDate = new Date(2017, 1, 8),
        //    sampleDataEndDate = new Date(2017, 1, 10);


        var sampleDataStartDate = new Date(2016, 5, 1),
            sampleDataEndDate = new Date(2016, 11, 31);

        vm.uploadHasResponse = true;
        vm.frauds = [];

        vm.uploadFraudData = uploadFraudData;
        vm.showFraudDetail = showFraudDetail;
        //vm.showFraudTransactions = showFraudTransactions;
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
                                    showEmployeeTerritory();
                                });
                        }, 500);
                    }, 1000);
                });

            $rootScope.$on('update-transacton-status', function(e, params){
                var foundIndex = _.findIndex(vm.transactions, {id: params.id});
                if (foundIndex > -1) vm.transactions[foundIndex].status = params.status;
            });
        }

        //function showFraudTransactions () {
        //    modalServices.showFraudResult()
        //        .then(function (datalist) {
        //            vm.frauds = fraudService.showFraudDataOnMap(datalist);
        //        });
        //}

        function uploadFraudData(file, errFiles, event) {
            event.stopPropagation();

            if (!file || errFiles.length) {
                alertServices.showError('File is invalid.\nAccepts excel file only.\n .xlsx, .xls');
                return;
            }

            vm.uploadHasResponse = false;

            fraudService.uploadEmployeeTransactionData(file)
                .then(function (response) {
                    console.log('successfully uploaded employee data: ', response);
                        //$timeout(function(){
                        //    vm.uploadHasResponse = true;
                            alertServices.showInfo('Data uploaded.', true);
                        //}, 3000);
                }, function (error) {
                    console.log('error on uploading employee data: ', error);
                })
                .finally(function () {
                    $timeout(function () {
                        vm.uploadHasResponse = true;
                    }, 1000);
                });
        }

        function showFraudDetail(item) {
            fraudService.showMarker(item.id);
        }

        function getSalesTransactions () {
            var dfd = $q.defer();

            vm.dataIsLoaded = false;

            vm.transactions = [];
            salesTransactionService.resetMarkers();

            fraudService.getTransactionsWithinDateRange(vm.selectedDate.start, vm.selectedDate.end, vm.filter.empId)
                .then(function(list){
                   vm.transactions = [];
                   list.forEach(function(item){
                       if (item.end_point_latlng) {
                           vm.transactions.push(item);
                       }
                   });
                    //salesTransactionService.initMarkers(list, true);
                    salesTransactionService.initMarkers(vm.transactions, true);
                    dfd.resolve(vm.transactions);
                }).finally(function(){
                    vm.dataIsLoaded = true;
                });

            return dfd.promise;
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

            var dateArray = [],
                idx;

            while(dateStart <= dateEnd) {
                dateArray.push({
                    date: dateStart,
                    date_formatted: moment(dateStart).format('ddd MMM D, YYYY'),
                    date_param: moment(dateStart).format('YYYY-MM-DD')
                });
                dateStart = dateStart.addDays(1);
            }

            var dateArrayParam = dateArray.map(function (item) {
                return item.date_param;
            });

            var promises = [];

            promises.push(
                fraudService.getDaysWithFraudTransactionsCount(dateArrayParam, vm.filter.empId)
                    .then(function (fraudListTransactions) {
                        //console.log('getDaysWithFraudTransactionsCount list: ', fraudListTransactions);
                        dateArray.forEach(function (dateItm, listIndex) {
                            idx = _.findIndex(fraudListTransactions, {date_param: dateItm.date_param});
                            if (idx > -1 && fraudListTransactions[idx].count) dateArray[listIndex]['fraudcount'] = fraudListTransactions[idx].count;
                        });
                    })
            );

            promises.push(
                fraudService.getDaysWithInvestigatedTransactionsCount(dateArrayParam, vm.filter.empId)
                    .then(function (investigatedListTransactions) {
                        //console.log('getDaysWithInvestigatedTransactionsCount: ', investigatedListTransactions);
                        dateArray.forEach(function (dateItm, listIndex) {
                            idx = _.findIndex(investigatedListTransactions, {date_param: dateItm.date_param});
                            if (idx > -1 && investigatedListTransactions[idx].count) dateArray[listIndex]['investigatedcount'] = investigatedListTransactions[idx].count;
                        });
                    })
            );

            promises.push(
                fraudService.getDaysWithClearedTransactionsCount(dateArrayParam, vm.filter.empId)
                    .then(function (clearedListTransactions) {
                        //console.log('getDaysWithClearedTransactionsCount: ', clearedListTransactions);
                        dateArray.forEach(function (dateItm, listIndex) {
                            idx = _.findIndex(clearedListTransactions, {date_param: dateItm.date_param});
                            if (idx > -1 && clearedListTransactions[idx].count) dateArray[listIndex]['clearedcount'] = clearedListTransactions[idx].count;
                        });
                    })
            );


            $q.all(promises)
                .finally(function(){
                    var newarray = [];
                    dateArray.map(function (item) {
                        if (item.hasOwnProperty('fraudcount')
                            || item.hasOwnProperty('investigatedcount')
                            || item.hasOwnProperty('clearedcount')) {
                            newarray.push(item);
                        }
                    });
                    dfd.resolve(newarray);
                });

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
                //alertServices.showInfo('Functionality will be included on Production');
            })
        }

        function onClickTransaction (item) {
            salesTransactionService.showMarkerById(item.id);
        }

        var listOfDaysTemp = [];

        function employeeFilterChanged () {
            getSalesTransactions();
            showEmployeeTerritory();
        }

        function hideUserTerritories () {
            userTerritoryPolygons.forEach(function(polygon){
                polygon.setMap(null);
                polygon = null;
            });
            userTerritoryPolygons = [];
        }

        function showEmployeeTerritory () {
            hideUserTerritories();

            userResourcesService.getUserTerritories(vm.filter.empId)
                .then(function(polygonResults){
                    polygonResults.forEach(function(data){
                        userTerritoryPolygons.push(userTerritoriesService.showTerritoryPolygon(data.territory.geom));
                    });
                });
        }

        function getTransactionByDate (dateItem) {
            //console.log('getTransactionByDate: ', dateItem);

            setDateGetData(dateItem.date);

            listOfDaysTemp = angular.copy(vm.listOfDays);
            vm.listOfDays = [];

            getSalesTransactions()
                .then(function(list){
                  //console.log('list: ',list);
                    gmapServices.fitToBoundsLatLngArray(list.map(function(itm){return itm.end_point_latlng;}));
                });
        }

        function returnToDayList () {
            salesTransactionService.resetTransactionVisuals();
            if (listOfDaysTemp.length) vm.listOfDays = angular.copy(listOfDaysTemp);
        }

    }
}());