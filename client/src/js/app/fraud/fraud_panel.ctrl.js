(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPanelController', ['fraudService', 'alertServices', '$timeout', 'modalServices', 'userSessionService', fraudPanelController]);

    function fraudPanelController (fraudService, alertServices, $timeout, modalServices, userSessionService) {
        var vm = this;

        vm.uploadHasResponse = true;
        vm.frauds = [];

        vm.uploadFraudData = uploadFraudData;
        vm.showFraudDetail = showFraudDetail;
        vm.showFraudTransactions = showFraudTransactions;

        initialize();

        function initialize () {
            var fraudData = userSessionService.getFraudData();
            //console.log('fraudData: ', fraudData);

            if (fraudData) {
                vm.frauds = fraudService.showFraudDataOnMap(fraudData);
            }

            $timeout(function(){
                showFraudTransactions();
            },0);
        }

        function showFraudTransactions () {
            modalServices.showFraudResult()
                .then(function (datalist) {
                    vm.frauds = fraudService.showFraudDataOnMap(datalist);
                });
        }

        function uploadFraudData(file, errFiles, event) {
            event.stopPropagation();

            console.log('uploadFraudData',file,errFiles);

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
    }
}());