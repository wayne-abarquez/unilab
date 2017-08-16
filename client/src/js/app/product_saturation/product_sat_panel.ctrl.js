(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSatPanelController', ['$rootScope', 'Branch', 'branchService', '$q', 'Product', 'productSatService', 'SEMESTERS', productSatPanelController]);

    function productSatPanelController ($rootScope, Branch, branchService, $q, Product, productSatService, SEMESTERS) {
        var vm = this;

        var aborts;

        var branchTotalCount = 0;
        var list = [];

        vm.productList = [];
        vm.selectedDate = null;

        vm.filter = {
            q: '',
            selectedType: 'name',
            selectedProduct: '',
            semester: null
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

        var firstWeek;

        vm.currentSelectedWeek = '';

        vm.toggleDataDisplayMessage = 'Show Heatmap';
        vm.toggleSaturationOrSalesDisplayMessage = 'Sales';

        vm.semesters = SEMESTERS;

        /* Scope Functions */
        vm.filterProductChanged = filterByProduct;
        vm.showBranch = showBranch;
        vm.sliderChanged = sliderChanged;
        vm.toggleDataDisplay = toggleDataDisplay;
        vm.toggleSaturationOrSalesChanged = toggleSaturationOrSalesChanged;
        vm.semesterChanged = semesterChanged;

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
                .then(function (response) {
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
            if (vm.toggleSaturationOrSalesModel) {
                semesterChanged(vm.filter.semester);
                return;
            }

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

        function toggleDataDisplay (flag) {
            vm.toggleDataDisplayMessage = flag ? 'Show Markers' : 'Show Heatmap';
            sliderChanged();
        }

        function toggleSaturationOrSalesChanged(flag) {
            vm.toggleSaturationOrSalesDisplayMessage = flag ? 'Saturation' : 'Sales';

            if (flag) {
                branchService.hideMarkers();
                if (vm.filter.semester) semesterChanged(vm.filter.semester);
                return;
            }

            branchService.hideHeatmap();
            branchService.showMarkers();

            vm.hasProduct.count = list.length;
            vm.hasProduct.percentage = Math.ceil(list.length / branchTotalCount * 100);
            vm.hasProduct.fraction = list.length + ' / ' + branchTotalCount;
            $rootScope.$broadcast('product-saturation-numbers-update', {data: vm.hasProduct});

        }

        function semesterChanged(semester) {
            branchService.getSelloutsByProduct(semester, vm.filter.selectedProduct)
                .then(function (sellouts) {
                    console.log('sellouts by product: ', sellouts);
                    branchService.displaySellouts(sellouts);

                    vm.hasProduct.count = sellouts.length;
                    vm.hasProduct.percentage = Math.ceil(sellouts.length / branchTotalCount * 100);
                    vm.hasProduct.fraction = sellouts.length + ' / ' + branchTotalCount;
                    $rootScope.$broadcast('product-saturation-numbers-update', {data: vm.hasProduct});
                });

        }
    }
}());