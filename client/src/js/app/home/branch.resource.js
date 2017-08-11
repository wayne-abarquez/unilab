(function(){
'use strict';

angular.module('demoApp.home')
    .factory('Branch', ['Restangular', 'Upload', Branch]);
    
    function Branch (Restangular, Upload) {
        var myModel = Restangular.all('branches');

        var resource = {
            cast: function (myid) {
                return Restangular.restangularizeElement(null, {id: myid}, 'branches');
            },

            uploadData: function (fileParam) {
                var uploadUrl = myModel.getRestangularUrl() + '/' + 'upload';
                return Upload.upload({
                    url: uploadUrl,
                    method: 'POST',
                    data: {file: fileParam}
                });
            },

            uploadSellOutData: function (fileParam) {
                var uploadUrl = myModel.getRestangularUrl() + '/sellouts/' + 'upload';
                return Upload.upload({
                    url: uploadUrl,
                    method: 'POST',
                    data: {file: fileParam}
                });
            },

            getSellouts: function (semester, branchIdsArray) {
                var param = {'semester': semester, 'branch_ids': branchIdsArray.join(',')};

                return myModel
                    .all('sellouts')
                    .getList(param);
            },

            getSelloutsByProduct: function (semester, product) {
                var param = {'semester': semester, 'product': product};

                return myModel
                    .all('sellouts')
                    .getList(param);
            }
        };

        Restangular.extendModel('branches', function (model) {
            return model;
        });

        angular.merge(myModel, resource);

        return myModel;
    }
}());