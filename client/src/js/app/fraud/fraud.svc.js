(function(){
'use strict';

angular.module('demoApp.fraud')
    .factory('fraudService', ['$q', '$timeout', 'Fraud', fraudService]);

    function fraudService ($q, $timeout, Fraud) {
        var service = {};

        service.uploadEmployeeData = uploadEmployeeData;

        function uploadEmployeeData (file) {
            var dfd = $q.defer();

            if (!file) {
                dfd.reject();
            } else {
                file.upload = Fraud.uploadEmployeeData(file);

                //Pace.start();
                //Pace.bar.progress = 0;
                //Pace.bar.render();

                file.upload.then(function (response) {
                        file.result = response.data;
                        dfd.resolve(response.data);
                }, function (error) {
                    dfd.reject(error);
                }, function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));

                    //console.log('progress: ',file.progress);
                    //Pace.bar.progress = file.progress;

                }).finally(function(){
                    //Pace.stop();
                });
            }

            return dfd.promise;
        }

        return service;
    }
}());