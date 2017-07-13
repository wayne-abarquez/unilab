(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPanelController', ['fraudService', 'alertServices', '$timeout', fraudPanelController]);

    function fraudPanelController (fraudService, alertServices, $timeout) {
        var vm = this;

        vm.uploadHasResponse = true;
        vm.frauds = [];

        vm.uploadFraudData = uploadFraudData;
        vm.showFraudDetail = showFraudDetail;

        initialize();

        function initialize () {

        }

        function uploadFraudData(file, errFiles) {
            console.log('uploadFraudData',file,errFiles);

            if (errFiles.length) {
                alertServices.showError('File is invalid.\nAccepts excel file only.\n .xlsx, .xls');
                return;
            }

            vm.uploadHasResponse = false;

            fraudService.uploadEmployeeData(file)
                .then(function (response) {
                    console.log('successfully uploaded employee data: ', response);
                    alertServices.showSuccess('Data uploaded.');
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
            console.log('showFraudDetail', item);
        }
    }
}());