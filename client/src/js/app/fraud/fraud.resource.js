(function () {
    'use strict';

    angular.module('demoApp.fraud')
        .factory('Fraud', ['Restangular', 'Upload', Fraud]);

    function Fraud(Restangular, Upload) {
        var myModel = Restangular.all('frauds');

        var resource = {
            cast: function (myid) {
                return Restangular.restangularizeElement(null, {id: myid}, 'frauds');
            },

            uploadEmployeeData: function (fileParam) {
                var uploadUrl = myModel.getRestangularUrl() + '/' + 'upload';
                return Upload.upload({
                    url: uploadUrl,
                    method: 'POST',
                    data: {file: fileParam}
                });
            }
        };

        angular.merge(myModel, resource);

        return myModel;
    }
}());