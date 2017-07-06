(function(){
'use strict';

angular.module('demoApp.home')
    .controller('indexController', ['$mdSidenav', indexController]);

    function indexController ($mdSidenav) {
        var vm = this;

        vm.initialize = initialize;
        vm.toggleLayerPanel = buildToggler('layerPanel');
        vm.toggleSearchPanel = buildToggler('searchPanel');
        vm.closeSideNav = closeSideNav;

        vm.lastSideNavOpenId = '';

        vm.initialize();

        function initialize() {
            console.log('initialize called');
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
    }
}());