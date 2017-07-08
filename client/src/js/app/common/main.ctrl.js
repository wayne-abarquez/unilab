(function () {
    'use strict';

    angular.module('demoApp')
        .controller('mainController', ['$rootScope', 'APP_NAME', '$mdSidenav', 'userSessionService', mainController]);

    function mainController($rootScope, APP_NAME, $mdSidenav, userSessionService) {
        var vm = this;

        $rootScope.appName = APP_NAME;

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
                link: '/admin',
                title: 'Admin',
                icon: 'contacts',
                can: ['ADMIN']
            },
            {
                link: '/logout',
                title: 'Logout',
                icon: 'exit_to_app',
                can: ['ADMIN', 'SALES']
            }
        ];

        vm.toggleMainMenu = buildToggler('mainMenuSidenav');
        vm.onMenuItemClick = onMenuItemClick;

        initialize();

        function initialize () {
            // loads user details
            userSessionService.userLogin()
                .then(function(user){
                   $rootScope.currentUser = angular.copy(user);
                   vm.menu = getUserMenu(user);
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
    }
}());