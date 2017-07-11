(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('salesPageController', ['$rootScope', 'gmapServices', 'modalServices', salesPageController]);

    function salesPageController ($rootScope, gmapServices, modalServices) {
        var vm = this;

        initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');

            $rootScope.$on('search-address-return-result', function (e, params) {
                if ($rootScope.hasOpenedModal) return;

                modalServices.showNewTransactionForm(e, params)
                    .finally(function () {
                        $rootScope.$broadcast('clear-search-address-bar');
                    });
            });
        }
    }
}());