(function () {
    'use strict';

    angular
        .module('demoApp', [
            'restangular',
            'LocalStorageModule',
            'ngMaterial',
            'ngAnimate',
            'oitozero.ngSweetAlert',
            'ngFileUpload',
            'md.data.table',
            'demoApp.home',
            'demoApp.admin',
            'demoApp.sales'
        ])

        .constant('APP_NAME', 'UNILAB')
        .constant('BASE_URL', window.location.origin)

        .config(['RestangularProvider', function (RestangularProvider) {
            //set the base url for api calls on our RESTful services
            var baseUrl = window.location.origin + '/api';
            RestangularProvider.setBaseUrl(baseUrl);
        }])

        .config(function (localStorageServiceProvider) {
            localStorageServiceProvider
                .setPrefix('UNILAB')
                .setStorageType('sessionStorage')
                .setNotify(true, true)
            ;
        })

        .run(function(userSessionService, $rootScope){
            userSessionService.userLogin()
                .then(function (user) {
                    $rootScope.currentUser = angular.copy(user);
                });
        })

        //.config(function ($mdThemingProvider) {
        //    $mdThemingProvider.theme('default')
        //        .primaryPalette('red')
        //        .accentPalette('pink');
        //})
    ;

}());

