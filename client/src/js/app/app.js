(function () {
    'use strict';

    angular
        .module('demoApp', [
            'ngMaterial',
            'ngAnimate',
            'oitozero.ngSweetAlert',
            'demoApp.home'
        ])

        .constant('APP_NAME', 'Unilab POC')
        .constant('BASE_URL', window.location.origin)

        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('red')
                .accentPalette('pink');
        });

}());

