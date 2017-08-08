(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSatPanelController', ['$rootScope', 'Branch', 'branchService', '$q', 'Product', 'productSatService', productSatPanelController]);

    function productSatPanelController ($rootScope, Branch, branchService, $q, Product, productSatService) {
        var vm = this;

        var aborts;

        var branchTotalCount = 0;
        var list = [];

        vm.productList = [];
        vm.selectedDate = null;

        vm.filter = {
            q: '',
            selectedType: 'name',
            selectedProduct: ''
        };

        vm.hasProduct = {
            count: 0,
            percentage: 0
        };

        /* Slider Variables */

        vm.weeks = [];

        vm.slider = {
            currentVal: 0
        };

        var selected;
        var firstWeek;

        vm.currentSelectedWeek = '';

        /* Scope Functions */
        vm.filterProductChanged = filterByProduct;
        vm.showBranch = showBranch;
        vm.sliderChanged = sliderChanged;
        vm.toggleDataDisplay = toggleDataDisplay;

        initialize();

        function initialize () {
            Product.getList()
                .then(function (response) {
                    vm.productList = vm.productList.concat(_.pluck(response.plain(), 'name'));
                });

            // get branch total count
            Branch.customPUT({count_all: 'count_all'}).then(function(response){
               var res = response.plain();
               branchTotalCount = res.count;
            });

            Branch.getList()
                .then(function(response){
                    branchService.loadMarkers(response.plain(), true);
                });

            vm.weeks = productSatService.getFiveWeeksDuration(new Date());
            firstWeek = vm.weeks[0];
            sliderChanged();

            //$rootScope.$on('product-saturation-time-slider-changes', function (e, params) {
            //    vm.selectedDate = angular.copy(params.selectedWeek);
            //
            //    if (!vm.filter.selectedProduct) return;
            //
            //    showResult(params.selectedWeek.weekRangeStart, params.selectedWeek.weekRangeEnd, vm.filter.selectedProduct);
            //});
        }

        function showResult (dateStart, dateEnd, selectedProduct) {
            aborts = $q.defer();

            list = [];

            Branch
                .withHttpConfig({timeout: aborts.promise})
                .getList({
                    start_date: dateStart,
                    end_date: dateEnd,
                    product: selectedProduct
                })
                .then(function (response) {
                    var result = response.plain();
                    var branchIds = result.map(function(item){return item.id;});
                    //branchService.highlightMarkers(branchIds, true);
                    branchService.highlightMarkersOnSaturation(branchIds, vm.toggleDataDisplayModel);

                    list = angular.copy(result);

                    vm.hasProduct.count = list.length;
                    vm.hasProduct.percentage = Math.ceil(list.length / branchTotalCount * 100);
                    vm.hasProduct.fraction = list.length + ' / ' + branchTotalCount;
                    $rootScope.$broadcast('product-saturation-numbers-update', {data: vm.hasProduct});
                });
        }

        function showBranch (branchId) {
            branchService.triggerClickBranch(branchId);
        }

        function filterByProduct () {
            $rootScope.$broadcast('show-product-saturation-slider');

            if (!vm.filter.selectedProduct || !vm.selectedDate)  return;

            showResult(vm.selectedDate.weekRangeStart, vm.selectedDate.weekRangeEnd, vm.filter.selectedProduct);
        }

        function sliderChanged() {
            vm.selectedDate = angular.copy(vm.weeks[vm.slider.currentVal]);
            vm.selectedDate.weekRangeStart = firstWeek.weekRangeStart;
            //selected.weekRangeStartFormatted = firstWeek.weekRangeStartFormatted;

            vm.currentSelectedWeek = vm.selectedDate.weekRangeStartFormatted + ' to ' + vm.selectedDate.weekRangeEndFormatted;

            //$rootScope.$broadcast('product-saturation-time-slider-changes', {selectedWeek: selected});

            //vm.selectedDate = angular.copy(selected);

            if (!vm.filter.selectedProduct) return;

            showResult(vm.selectedDate.weekRangeStart, vm.selectedDate.weekRangeEnd, vm.filter.selectedProduct);
        }

        vm.toggleDataDisplayMessage = 'Show Heatmap';

        function toggleDataDisplay (flag) {
            vm.toggleDataDisplayMessage = flag ? 'Show Markers' : 'Show Heatmap';
            //if (flag) { // show heatmap
                sliderChanged();
            //}
        }
    }
}());