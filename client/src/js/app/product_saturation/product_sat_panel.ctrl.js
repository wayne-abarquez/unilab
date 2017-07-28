(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSatPanelController', ['$rootScope', 'Branch', 'branchService', '$q', 'Product', productSatPanelController]);

    function productSatPanelController ($rootScope, Branch, branchService, $q, Product) {
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

        vm.filterProductChanged = filterByProduct;
        vm.showBranch = showBranch;

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

            $rootScope.$on('product-saturation-time-slider-changes', function (e, params) {
                vm.selectedDate = angular.copy(params.selectedWeek);

                if (!vm.filter.selectedProduct) return;

                showResult(params.selectedWeek.weekRangeStart, params.selectedWeek.weekRangeEnd, vm.filter.selectedProduct);
            });
        }

        function showResult (dateStart, dateEnd, selectedProduct) {
            aborts = $q.defer();

            list = [];
            branchService.resetMarkersColor(true);

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
                    branchService.highlightMarkers(branchIds, true);

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
    }
}());