(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPageController', ['gmapServices', 'salesTransactionService', 'TRANSACTION_STATUSES', 'alertServices', fraudPageController]);

    function fraudPageController (gmapServices, salesTransactionService, TRANSACTION_STATUSES, alertServices) {
        var vm = this;

        initialize();

        function initialize () {
            // Mark Fraud
            $(document).on('click', '#mark-fraud-btn', function () {
                var id = $(this).data('transaction-id');
                salesTransactionService.updateTransactionStatus(id, TRANSACTION_STATUSES.FRAUD);
                alertServices.showSuccess('Transaction marked as FRAUD.');
            });

            // mark cleared
            $(document).on('click', '#mark-cleared-btn', function () {
                var id = $(this).data('transaction-id');
                salesTransactionService.updateTransactionStatus(id, TRANSACTION_STATUSES.CLEARED);
                alertServices.showSuccess('Transaction marked as CLEARED.');
            });

            // investigate
            $(document).on('click', '#mark-investigate-btn', function () {
                var id = $(this).data('transaction-id');
                salesTransactionService.updateTransactionStatus(id, TRANSACTION_STATUSES.INVESTIGATING);
                alertServices.showSuccess('Transaction marked as for INVESTIGATION.');
            });

            gmapServices.createMap('map-canvas');
        }

    }
}());