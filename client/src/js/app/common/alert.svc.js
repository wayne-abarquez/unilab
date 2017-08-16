(function () {
    'use strict';

    angular.module('demoApp')
        .factory('alertServices', ['$mdToast', 'SweetAlert', alertServices]);

    function alertServices($mdToast, SweetAlert) {
        var service = {};

        service.showBottomLeftToast = showBottomLeftToast;
        service.showTopRightToast = showTopRightToast;
        service.showNoDataAvailablePrompt = showNoDataAvailablePrompt;
        service.showDismissableToast = showDismissableToast;

        service.showConfirm = showConfirm;
        service.showSuccess = showSuccess;
        service.showInfo = showInfo;
        service.showError = showError;


        function showToast(message, position, delay) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position(position)
                    .hideDelay(delay || 2000)
            );
        }

        function showBottomLeftToast(message, delay) {
            showToast(message, 'bottom left', delay);
        }

        function showTopRightToast(message, delay) {
            showToast(message, 'top right', delay);
        }

        function showDismissableToast (message, delay) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position('bottom left')
                    .hideDelay(delay)
            );
        }

        function showNoDataAvailablePrompt(entityName) {
            service.showBottomLeftToast('No ' + entityName + ' data available for this area.');
        }

        function showMessage(message, type, isAutoClose) {
            var opts = {
                title: message,
                type: type
            };

            if (isAutoClose) {
                angular.merge(opts, {timer: 1500, showConfirmButton: false});
            }

            return SweetAlert.swal(opts);
        }

        function showSuccess(message) {
            return showMessage(message, 'success');
        }

        function showError(message) {
            return showMessage(message, 'error');
        }

        function showInfo(message, isAutoClose) {
            return showMessage(message, 'info', isAutoClose);
        }

        function showConfirm (title, message, callbackOnConfirm) {
            return SweetAlert.swal({
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

        return service;
    }
}());