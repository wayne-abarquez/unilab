(function(){
'use strict';

angular.module('demoApp.home')
    .factory('userSessionService', ['User', 'localStorageService', '$q', userSessionService]);

    function userSessionService (User, localStorageService, $q) {
        var service = {};

        // user details
        var USER = 'USER',
            FRAUD_DATA = 'FRAUD_DATA'

        service.userLogin = userLogin;
        service.userLogout = userLogout;
        service.getUserInfo = getUserInfo;
        service.saveFraudData = saveFraudData;
        service.getFraudData = getFraudData;


        function saveFraudData (data) {
            if (!localStorageService.isSupported) return;

            localStorageService.set(FRAUD_DATA, data);
        }

        function getFraudData () {
            if (!localStorageService.isSupported) return;

            return localStorageService.get(FRAUD_DATA);
        }


        function userLogin () {
            if (!localStorageService.isSupported) return;

            var dfd = $q.defer();
            var currentUser = getUserInfo();

            if (currentUser) {
                dfd.resolve(currentUser);
            } else {
                User.customGET('current_user')
                    .then(function (response) {
                        localStorageService.set(USER, response.plain());
                        dfd.resolve(response.plain());
                    }, function (error) {
                        dfd.reject(error);
                    });
            }

            return dfd.promise;
        }

        function userLogout () {
            if (!localStorageService.isSupported) return;

            // clear all data on local storage on logout
            localStorageService.clearAll();
        }

        function getUserInfo (isRestangular) {
            if (!localStorageService.isSupported) return;

            var userObj = localStorageService.get(USER);

            return isRestangular && userObj ?
                            User.cast(userObj.id)
                            : userObj;
        }

        return service;
    }
}());