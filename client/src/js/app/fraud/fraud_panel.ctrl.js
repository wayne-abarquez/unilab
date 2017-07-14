(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPanelController', ['fraudService', 'alertServices', '$timeout', 'modalServices', fraudPanelController]);

    function fraudPanelController (fraudService, alertServices, $timeout, modalServices) {
        var vm = this;

        vm.uploadHasResponse = true;
        vm.frauds = [];

        vm.uploadFraudData = uploadFraudData;
        vm.showFraudDetail = showFraudDetail;

        initialize();

        function initialize () {

        }

        function uploadFraudData(file, errFiles, event) {
            event.stopPropagation();

            console.log('uploadFraudData',file,errFiles);

            if (!file || errFiles.length) {
                alertServices.showError('File is invalid.\nAccepts excel file only.\n .xlsx, .xls');
                return;
            }

            vm.uploadHasResponse = false;
            fraudService.uploadEmployeeData(file)
                .then(function (response) {
                    console.log('successfully uploaded employee data: ', response);
                    alertServices.showInfo('Data uploaded. Showing Fraud Report...', true);
                    $timeout(function(){
                        modalServices.showFraudResult()
                            .then(function(datalist){
                               vm.frauds = fraudService.showFraudDataOnMap(datalist);
                            });
                    }, 1000);
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
    }
}());