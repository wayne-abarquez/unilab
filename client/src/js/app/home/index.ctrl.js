(function(){
'use strict';

angular.module('demoApp.home')
    .controller('indexController', ['gmapServices', '$mdSidenav', indexController]);

    function indexController (gmapServices, $mdSidenav) {
        var vm = this;

        vm.toggleSearchPanel = buildToggler('searchPanel');
        vm.closeSideNav = closeSideNav;

        vm.lastSideNavOpenId = '';

        vm.showAddBranchModal = showAddBranchModal;

        initialize();

        function initialize() {
            gmapServices.createMap('map-canvas');
        }

        function buildToggler(navID) {
            return function () {
                if (vm.lastSideNavOpenId && vm.lastSideNavOpenId !== navID) {
                    closeSideNav(vm.lastSideNavOpenId);
                }

                $mdSidenav(navID).toggle();

                vm.lastSideNavOpenId = navID;
            }
        }

        function closeSideNav(navID) {
            $mdSidenav(navID).close();
        }

        function showAddBranchModal () {

        }
    }
}());