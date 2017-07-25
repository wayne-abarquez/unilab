(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSatSliderController', ['$rootScope', 'productSatService', productSatSliderController]);

    function productSatSliderController ($rootScope, productSatService) {
        var vm = this;

        vm.weeks = [];

        vm.slider = {
            currentVal: 0
        };

        var selected;

        vm.currentSelectedWeek = '';

        vm.sliderChanged = sliderChanged;

        initialize();
        
        function initialize () {
            vm.weeks = productSatService.getFiveWeeksDuration(new Date());
            sliderChanged();
        }

        function sliderChanged () {
           selected = vm.weeks[vm.slider.currentVal];

           vm.currentSelectedWeek = selected.weekRangeStartFormatted + ' to ' + selected.weekRangeEndFormatted;

           $rootScope.$broadcast('product-saturation-time-slider-changes', {selectedWeek: selected});
        }
    }
}());