(function(){
'use strict';

angular.module('demoApp.home')
    .controller('indexController', ['gmapServices', '$rootScope', '$mdSidenav', 'modalServices', '$injector', indexController]);

    function indexController (gmapServices, $rootScope, $mdSidenav, modalServices, $injector) {
        var vm = this;

        vm.lastSideNavOpenId = '';

        vm.toggleSearchPanel = buildToggler('searchPanel');
        vm.closeSideNav = closeSideNav;

        initialize();

        function initialize() {
            gmapServices.createMap('map-canvas');

            $rootScope.$on('search-address-return-result', function (e, params) {
               if ($rootScope.hasOpenedModal) return;

               modalServices.showMapPlotOptions(e)
                   .then(function(selectedOption){
                       $injector.get('modalServices')[selectedOption.action](e, params)
                           .finally(function(){
                               $rootScope.$broadcast('clear-search-address-bar');
                           });
                   });
            });
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