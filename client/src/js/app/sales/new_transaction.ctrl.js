(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('newTransactionController', ['modalServices', newTransactionController]);

    function newTransactionController (modalServices) {
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

        }

        function close () {
            modalServices.closeModal();
        }
    }
}());