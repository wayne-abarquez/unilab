google.load('visualization', '1', {
    packages: ['table']
});

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
            'angularMoment',
            'smDateTimeRangePicker',
            'ngMaterialDateRangePicker',
            'demoApp.home',
            'demoApp.admin',
            'demoApp.sales',
            'demoApp.fraud',
            'demoApp.productSaturation'
        ])

        .constant('APP_NAME', 'UNILAB')
        .constant('BASE_URL', window.location.origin)
        .constant('MARKER_BASE_URL', '/images/markers/')

        .constant('DEMO_MODE_MESSAGE', 'Functionality disabled for POC')

        .constant('SEMESTERS', [
            {
                display: 'Sem 1 - 2016',
                value: '2016-01-01'
            },
            {
                display: 'Sem 2 - 2016',
                value: '2016-07-01'
            }
        ])


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

        .filter('underscoreless', function () {
            return function (input) {
                return input.replace(/_/g, ' ');
            };
        })
        .config(function ($mdThemingProvider) {
        //    $mdThemingProvider.theme('default')
        //        .primaryPalette('red')
        //        .accentPalette('pink');
            $mdThemingProvider.theme('docs-dark', 'default')
                .primaryPalette('yellow')
                .dark();
        })
    ;

}());

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
};

window.paceOptions = {
    ajax: {
        trackMethods: ["GET", "POST", "DELETE"],
        trackWebSockets: false
    },
    document: true, // disabled
    eventLag: true,
    restartOnPushState: true,
    restartOnRequestAfter: true
};