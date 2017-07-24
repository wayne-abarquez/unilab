(function () {
    'use strict';

    angular
        .module('demoApp.fraud', [])

        .constant('TRANSACTION_STATUSES', {
            'CLEARED': 'CLEARED',
            'FRAUD': 'FRAUD',
            'INVESTIGATING': 'INVESTIGATING'
        })

    ;

}());
