(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('salesPageController', ['gmapServices', '$rootScope', '$mdSidenav', salesPageController]);

    function salesPageController (gmapServices, $rootScope, $mdSidenav) {
        var vm = this;

        var branchId;

        vm.showTerritoryPanelDetail = showTerritoryPanelDetail;

        initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');

            $(document).on('click', '#edit-branch-btn', function(){
                branchId = $(this).data('branch-id');
                console.log('edit branch with id = ' + branchId);
                // TODO: show edit modal
            });

            $(document).on('click', '#compare-branch-btn', function () {
                branchId = $(this).data('branch-id');
                console.log('compare branch with id = '+branchId);
                // TODO: show compare table, same as cesar
            });
        }

        function showTerritoryPanelDetail () {
            $mdSidenav('territoryInfoPanelSidenav')
                .open()
                .then(function () {
                    $rootScope.showTerritoryDetailBtn = false;
                    $rootScope.showGRDPPanel = true;
                });
        }

    }
}());