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
        var firstWeek;

        vm.currentSelectedWeek = '';

        vm.sliderChanged = sliderChanged;

        initialize();
        
        function initialize () {
            vm.weeks = productSatService.getFiveWeeksDuration(new Date());
            firstWeek = vm.weeks[0];
            sliderChanged();
        }

        function sliderChanged () {
           selected = vm.weeks[vm.slider.currentVal];
           selected.weekRangeStart = firstWeek.weekRangeStart;
           //selected.weekRangeStartFormatted = firstWeek.weekRangeStartFormatted;

           vm.currentSelectedWeek = selected.weekRangeStartFormatted + ' to ' + selected.weekRangeEndFormatted;

           $rootScope.$broadcast('product-saturation-time-slider-changes', {selectedWeek: selected});
        }
    }
}());