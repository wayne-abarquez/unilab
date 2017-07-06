(function(){
'use strict';

angular.module('demoApp.home')
    .factory('Solars', ['Restangular', 'Upload', Solars]);
    
    function Solars (Restangular, Upload) {
        var solarModel = Restangular.all('solars');

        Restangular.extendModel('solars', function (model) {

            model.deletePanel = function (panel_id) {
                return model
                    .one('panels', panel_id)
                    .remove();
            };

            model.upload = function (_file, _caption) {
                var uploadUrl = model.getRestangularUrl() + '/' + 'photos',
                    caption = _caption || '';
                return Upload.upload({
                           url: uploadUrl,
                           method: 'POST',
                           data: {file: _file, caption: caption}
                       });
            };

            return model;
        });

        return solarModel;
    }
}());