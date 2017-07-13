(function(){
'use strict';

angular.module('demoApp.fraud')
    .controller('fraudPageController', ['gmapServices', fraudPageController]);

    function fraudPageController (gmapServices) {
        var vm = this;

        initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');
        }

    }
}());