(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSatPanelController', ['modalServices', '$rootScope', '$scope', 'alertServices', 'Branch', 'branchService', '$q', '$timeout', 'Product', '$mdDateRangePicker', productSatPanelController]);

    function productSatPanelController (modalServices, $rootScope, $scope, alertServices, Branch, branchService, $q, $timeout, Product, $mdDateRangePicker) {
        var vm = this;

        var aborts;

        vm.list = [];
        vm.productList = [];

        vm.filter = {
            q: '',
            selectedType: 'name',
            selectedProduct: ''
        };

        vm.hasProduct = {
            count: 0,
            percentage: 0
        };

        vm.selectedDate = null;

        var branchTotalCount = 0;

        vm.dataIsLoaded = true;

        vm.filterProductChanged = filterByProduct;
        vm.newProduct = newProduct;
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

                if (!vm.filter.selectedProduct) {
                    //alertServices.showInfo('Please select product');
                    return;
                }

                showResult(params.selectedWeek.weekRangeStart, params.selectedWeek.weekRangeEnd, vm.filter.selectedProduct);
            });
        }

        function showResult (dateStart, dateEnd, selectedProduct) {
            aborts = $q.defer();

            vm.list = [];
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
                    branchService.highlightMarkers(branchIds);
                    loadBranchList(result);

                    vm.hasProduct.count = vm.list.length;
                    vm.hasProduct.percentage = Math.ceil(vm.list.length / branchTotalCount * 100);
                    vm.hasProduct.fraction = vm.list.length + ' / ' + branchTotalCount;
                    $rootScope.$broadcast('product-saturation-numbers-update', {data: vm.hasProduct});
                })
                .finally(function () {
                    $timeout(function () {
                        vm.dataIsLoaded = true;
                    }, 1000);
                });
        }

        function showBranch (branchId) {
            branchService.triggerClickBranch(branchId);
        }

        //function clear (isInitialLoad) {
        //    if (!vm.filter.selectedType) {
        //        alertServices.showInfo('Please select filter type');
        //        vm.filter.q = '';
        //        return;
        //    }
        //
        //    if (!vm.filter.q && !isInitialLoad) {
        //        filterTypeChanged();
        //        return;
        //    }
        //
        //    if (aborts) aborts.resolve();
        //
        //    vm.dataIsLoaded = false;
        //}

        function loadBranchList (list) {
            vm.list = angular.copy(list);
        }

        function filterByProduct () {
            $rootScope.$broadcast('show-product-saturation-slider');

            if (!vm.filter.selectedProduct || !vm.selectedDate) {
                //vm.dataIsLoaded = false;
                return;
            }

            //vm.dataIsLoaded = true;
            showResult(vm.selectedDate.weekRangeStart, vm.selectedDate.weekRangeEnd, vm.filter.selectedProduct);
        }

        function newProduct(event) {
            modalServices.showNewProductForm(event)
                .then(function (product) {

                });
        }
    }
}());