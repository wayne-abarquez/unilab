(function(){
'use strict';

angular.module('demoApp.home')
    .factory('Branch', ['Restangular', Branch]);
    
    function Branch (Restangular) {
        var myModel = Restangular.all('branches');

        var resource = {
            cast: function (myid) {
                return Restangular.restangularizeElement(null, {id: myid}, 'branches');
            }
        };

        Restangular.extendModel('branches', function (model) {
            //model.deletePanel = function (panel_id) {
            //    return model
            //        .one('panels', panel_id)
            //        .remove();
            //};
            //
            //model.upload = function (_file, _caption) {
            //    var uploadUrl = model.getRestangularUrl() + '/' + 'photos',
            //        caption = _caption || '';
            //    return Upload.upload({
            //               url: uploadUrl,
            //               method: 'POST',
            //               data: {file: _file, caption: caption}
            //           });
            //};
            return model;
        });

        angular.merge(myModel, resource);

        return myModel;
    }
}());