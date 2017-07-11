(function () {
    'use strict';

    angular
        .module('demoApp.sales', [])

        .constant('SALES_TRANSACTION_TYPES', ['client visit', 'gas', 'flight'])
        .constant('BRANCH_TYPES', ['MDC', 'LKA', 'GT'])

    ;

}());
