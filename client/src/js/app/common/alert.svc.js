(function () {
    'use strict';

    angular.module('demoApp')
        .factory('alertServices', ['$mdToast', 'SweetAlert', alertServices]);

    function alertServices($mdToast, SweetAlert) {
        var service = {};

        service.showBottomLeftToast = showBottomLeftToast;
        service.showTopRightToast = showTopRightToast;
        service.showNoDataAvailablePrompt = showNoDataAvailablePrompt;
        //service.showFilterSelectionEmpty = showFilterSelectionEmpty;
        service.showConfirm = showConfirm;
        service.showSuccess = showSuccess;

        function showToast(message, position) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position(position)
                    .hideDelay(2000)
            );
        }

        function showBottomLeftToast(message) {
            showToast(message, 'bottom left');
        }

        function showTopRightToast(message) {
            showToast(message, 'top right');
        }

        function showMessage(message, type) {
            SweetAlert.swal({
                title: message,
                type: type
            });
        }

        function showSuccess(message) {
            showMessage(message, 'success');
        }

        function showNoDataAvailablePrompt(entityName) {
            service.showBottomLeftToast('No ' + entityName + ' data available for this area.');
        }

        function showConfirm (title, message, callbackOnConfirm) {
            SweetAlert.swal({
                    title: title,
                    text: message,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes",
                    closeOnConfirm: true
                },
                callbackOnConfirm);
        }



        //function showFilterSelectionEmpty() {
        //    showMessage('Please select filter type.', 'warning');
        //}
        //
        //function showQueryIsEmpty() {
        //    showMessage('Please fill in search query.', 'info');
        //}

        return service;
    }
}());