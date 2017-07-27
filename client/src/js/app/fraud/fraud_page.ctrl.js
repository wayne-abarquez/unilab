(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPageController', ['gmapServices', 'salesTransactionService', 'TRANSACTION_STATUSES', 'alertServices', fraudPageController]);

    function fraudPageController (gmapServices, salesTransactionService, TRANSACTION_STATUSES, alertServices) {
        var vm = this;

        var timeoutId;
        var remarksContent;

        initialize();

        function initialize () {

            $(document).on('change paste keyup', 'textarea#transaction-remarks-textarea', function () {
                var id = $(this).data('transaction-id');
                remarksContent = $(this).val();
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function () {
                    salesTransactionService.saveTransactionRemarks(id, remarksContent)
                        .then(function(response){
                            $(document)
                                .find('#transaction-remarks-textarea-response')
                                .text('Saved. ' + new Date().toLocaleTimeString())
                                .fadeIn()
                                .css({'display': 'inline'})
                                .delay(5000)
                                .queue(function(n){
                                    $(this).fadeOut();
                                    n();
                                });
                        });
                }, 1000);
            });

            // Mark Fraud
            $(document).on('click', '#mark-fraud-btn', function () {
                var id = $(this).data('transaction-id');

                salesTransactionService.updateTransactionStatus(id, TRANSACTION_STATUSES.FRAUD)
                    .then(function(){
                        alertServices.showBottomLeftToast('Transaction marked as FRAUD.');
                    });
            });

            // mark cleared
            $(document).on('click', '#mark-cleared-btn', function () {
                var id = $(this).data('transaction-id');

                salesTransactionService.updateTransactionStatus(id, TRANSACTION_STATUSES.CLEARED)
                    .then(function(){
                        alertServices.showBottomLeftToast('Transaction marked as CLEARED.');
                    });
            });

            // investigate
            $(document).on('click', '#mark-investigate-btn', function () {
                var id = $(this).data('transaction-id');

                salesTransactionService.updateTransactionStatus(id, TRANSACTION_STATUSES.INVESTIGATING)
                    .then(function(){
                        alertServices.showBottomLeftToast('Transaction marked as for INVESTIGATION.');
                    });
            });

            gmapServices.createMap('map-canvas');
        }

    }
}());