(function () {
    'use strict';

    angular.module('demoApp')
        .controller('mainController', ['$rootScope', 'APP_NAME', '$mdSidenav', 'userSessionService', 'alertServices', 'branchService', mainController]);

    function mainController($rootScope, APP_NAME, $mdSidenav, userSessionService, alertServices, branchService) {
        var vm = this;

        $rootScope.appName = APP_NAME;
        $rootScope.showLegend = false;

        /* Side Nav Menus */
        vm.menu = [];

        var MENU_SELECTIONS = [
            {
                link: '/',
                title: 'Home',
                icon: 'home',
                can: ['ADMIN', 'SALES']
            },
            {
                link: '/channeldiversification',
                title: 'Channel Diversification',
                icon: 'track_changes',
                can: ['ADMIN', 'SALES']
            },
            {
                link: '/frauddetect',
                title: 'Fraud Detection',
                icon: 'fingerprint',
                can: ['ADMIN']
            },
            {
                link: '/productsaturation',
                title: 'Product Saturation',
                icon: 'assessment',
                can: ['ADMIN']
            },
            {
                link: '/logout',
                title: 'Logout',
                icon: 'exit_to_app',
                can: ['ADMIN', 'SALES']
            }
        ];

        var branchId,
            branchMarker;

        $rootScope.showBranchCompareTable = false;

        vm.toggleMainMenu = buildToggler('mainMenuSidenav');
        vm.onMenuItemClick = onMenuItemClick;
        vm.showBanchCompareTableAction = showBanchCompareTableAction;
        vm.showTerritoryPanelDetail = showTerritoryPanelDetail;

        initialize();

        function initialize () {
            // loads user details
            $rootScope.$watch('currentUser', function(newValue, oldValue){
                if (!newValue) return;
                vm.menu = getUserMenu(newValue);
            });

            // Compare Branch
            $(document).on('click', '#compare-branch-btn', function () {
                branchId = $(this).data('branch-id');
                branchMarker = branchService.getBranchById(branchId);

                if (branchMarker) {
                    $rootScope.$broadcast('close-territory-info-panel');
                    $rootScope.showBranchCompareTable = true;

                    var restObj = branchService.getRestangularObj(branchMarker.branch.id);

                    // get branch products
                    restObj.getList('products')
                        .then(function(response){
                            branchMarker.branch.products = angular.copy(response.plain());
                            $rootScope.$broadcast('new-compare-branch', branchMarker.branch);
                            branchService.dismissInfowindow();
                        });
                }
            });

            // Edit Branch
            $(document).on('click', '#edit-branch-btn', function () {
                branchId = $(this).data('branch-id');
                console.log('edit branch with id = ' + branchId);
                // TODO: show edit modal
                branchMarker = branchService.getBranchById(branchId);
                console.log('compare this branch: ', branchMarker);
            });

            // Delete Branch
            $(document).on('click', '#delete-branch-btn', function () {
                branchId = $(this).data('branch-id');

                alertServices.showConfirm('Delete Branch', 'Are your sure you want to delete this branch?', function (isConfirm) {
                    // TODO: ajax delete on confirm
                    if (isConfirm) alert('branch deleted!');
                })
            });

            $rootScope.$on('modal-opened', function() {
                $rootScope.hasOpenedModal = true;
            });

            $rootScope.$on('modal-closed', function () {
                $rootScope.hasOpenedModal = false;
            });
        }

        function getUserMenu (user) {
            // TODO: this must come from backend
            var result = [];

            MENU_SELECTIONS.forEach(function(item){
                if (item.can.indexOf(user.role.toUpperCase()) > -1) return result.push(item);
            });

            return result;
        }

        function buildToggler(navID) {
            return function () {
                $mdSidenav(navID)
                    .toggle();
            }
        }

        function onMenuItemClick (item) {
            if (item.title.toLowerCase() == 'logout') {
                // clean local storage
                userSessionService.userLogout();
            }

            window.location.href = item.link;
        }

        function showBanchCompareTableAction () {
            $rootScope.showBranchCompareTable = true;
        }

        function showTerritoryPanelDetail() {
            $mdSidenav('territoryInfoPanelSidenav')
                .open()
                .then(function () {
                    $rootScope.showTerritoryDetailBtn = false;
                    $rootScope.showGRDPPanel = true;
                });
        }
    }
}());