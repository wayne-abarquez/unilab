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
            'demoApp.home',
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

        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('red')
                .accentPalette('pink');
        })
    ;

}());

