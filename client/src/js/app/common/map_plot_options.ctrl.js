(function(){
'use strict';

angular.module('demoApp')
    .controller('mapPlotOptionsController', ['modalServices', mapPlotOptionsController]);

    function mapPlotOptionsController (modalServices) {
        var vm = this;

        vm.options = [
            {
                name: 'New Branch',
                action: 'showNewBranchForm'
            },
            {
                name: 'New Sales Transaction',
                action: 'showNewTransactionForm'
            }
        ];

        vm.selectOption = selectOption;
        vm.cancel = cancel;

        function selectOption (opt) {
            modalServices.hideResolveModal(opt);
        }

        function cancel () {
            modalServices.closeModal();
        }

    }
}());