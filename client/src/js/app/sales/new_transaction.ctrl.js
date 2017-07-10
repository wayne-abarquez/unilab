(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('newTransactionController', ['modalServices', 'alertServices', newTransactionController]);

    function newTransactionController (modalServices, alertServices) {
        var vm = this;

        vm.transactionTypes = [
            'client visit',
            'gas',
            'flight'
        ];

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