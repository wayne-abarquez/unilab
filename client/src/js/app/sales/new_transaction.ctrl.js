(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('newTransactionController', ['SALES_TRANSACTION_TYPES', 'modalServices', 'alertServices', newTransactionController]);

    function newTransactionController (SALES_TRANSACTION_TYPES, modalServices, alertServices) {
        var vm = this;

        vm.transactionTypes = SALES_TRANSACTION_TYPES;

        vm.form = {};
        vm.transaction = {};

        vm.save = save;
        vm.close = close;

        initialize();

        function initialize () {

        }

        function save () {
            alertServices.showSuccess('Transaction saved.');
            modalServices.hideResolveModal();
        }

        function close () {
            modalServices.closeModal();
        }
    }
}());