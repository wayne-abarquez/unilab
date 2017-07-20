(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSaturationPageController', ['gmapServices', productSaturationPageController]);

    function productSaturationPageController (gmapServices) {
        var vm = this;

        initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');
        }

    }
}());