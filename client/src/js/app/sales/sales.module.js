(function () {
    'use strict';

    angular
        .module('demoApp.sales', [])

        .constant('SALES_TRANSACTION_TYPES', ['CLIENT VISIT', 'GAS', 'FLIGHT'])
        .constant('BRANCH_TYPES', ['MDC', 'LKA', 'GT'])

    ;

}());
