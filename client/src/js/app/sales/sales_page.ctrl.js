(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('salesPageController', ['gmapServices', 'modalServices', salesPageController]);

    function salesPageController (gmapServices, modalServices) {
        var vm = this;

        vm.showNewTransactionForm = showNewTransactionForm;

        initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');
        }

        function showNewTransactionForm (event) {
            modalServices.showNewTransactionForm(event)
        }
    }
}());