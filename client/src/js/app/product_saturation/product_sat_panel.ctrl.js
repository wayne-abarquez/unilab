(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSatPanelController', ['modalServices', '$rootScope', '$scope', 'alertServices', 'Branch', 'branchService', '$q', '$timeout', 'Product', '$mdDateRangePicker', productSatPanelController]);

    function productSatPanelController (modalServices, $rootScope, $scope, alertServices, Branch, branchService, $q, $timeout, Product, $mdDateRangePicker) {
        var vm = this;

        var aborts;

        vm.productList = [''];

        vm.filter = {
            q: '',
            selectedType: 'name',
            selectedProduct: ''
        };

        vm.hasProduct = {
            count: 0,
            percentage: 0
        };

        vm.selectedDate = {
            formatted: '',
            start: null,
            end: null
        };

        vm.selectedRange = {
            selectedTemplate: 'TW',
            selectedTemplateName: 'This Week',
            dateStart: null,
            dateEnd: null,
            showTemplate: false,
            fullscreen: false,
            disableTemplates: "NW",
            //maxRange: new Date(),
            onePanel: true
        };

        vm.dataIsLoaded = false;

        vm.filterChanged = filterChanged;
        vm.filterTypeChanged = filterTypeChanged;
        vm.newProduct = newProduct;
        vm.showBranch = showBranch;

        // filters
        vm.filterByName = filterByName;
        vm.filterByTerritory = filterByTerritory;
        vm.filterByBoundary = filterByBoundary;
        vm.filterProductChanged = filterByProduct;
        vm.pickDateRange = pickDateRange;


        initialize();

        function initialize () {
            Product.getList()
                .then(function (response) {
                    vm.productList = vm.productList.concat(_.pluck(response.plain(), 'name'));
                });

            vm.filter.types =  [
                {
                    name: 'name',
                    action: 'vm.filterByName()'
                },
                {
                    name: 'territory',
                    action: 'vm.filterByTerritory()'
                },
                {
                    name: 'boundary',
                    action: 'vm.filterByBoundary()'
                }
            ];

            filterChanged(true);
        }

        function showBranch (branchId) {
            branchService.triggerClickBranch(branchId);
        }

        function clear (isInitialLoad) {
            if (!vm.filter.selectedType) {
                alertServices.showInfo('Please select filter type');
                vm.filter.q = '';
                return;
            }

            if (!vm.filter.q && !isInitialLoad) {
                filterTypeChanged();
                return;
            }

            if (aborts) aborts.resolve();

            vm.dataIsLoaded = false;
        }

        function filterChanged (isInitialLoad) {
            clear(isInitialLoad);

            switch (vm.filter.selectedType) {
                case 'product':
                    filterByProduct();
                    break;
                case 'name':
                case 'territory':
                case 'boundary':
                    var filter = _.findWhere(vm.filter.types, {name: vm.filter.selectedType});
                    $scope.$eval(filter.action);
                    break;
                default:
                    filterByName();
            }
        }

        function filterTypeChanged () {
            if (vm.filter.selectedType == 'product') return;

            vm.filter.q = '';
            vm.list = [];
            branchService.resetMarkersColor();
            branchService.hideMarkers();

            $rootScope.$broadcast('product-saturation-numbers-update', {data: false});
        }

        function loadBranchList (list) {
            vm.list = angular.copy(list);
            branchService.loadMarkers(vm.list, true);

            var found;
            if (list.length) {
                branchService.loadProducts(list)
                    .then(function(result){
                        result.forEach(function(item){
                            found = _.findWhere(vm.list, {id: item.id});
                            if (found) found['products'] = angular.copy(item.products);
                        });
                    });
            }
        }

        function filterByName() {
            aborts = $q.defer();

            Branch
                .withHttpConfig({timeout: aborts.promise})
                .getList({name: vm.filter.q})
                .then(function(response){
                    loadBranchList(response.plain());
                })
                .finally(function(){
                    $timeout(function(){
                        vm.dataIsLoaded = true;
                    }, 1000);
                });

        }

        function filterByTerritory () {
            aborts = $q.defer();

            Branch
                .withHttpConfig({timeout: aborts.promise})
                .getList({territory: vm.filter.q})
                .then(function (response) {
                    loadBranchList(response.plain());
                })
                .finally(function () {
                    $timeout(function () {
                        vm.dataIsLoaded = true;
                    }, 1000);
                });
        }

        function filterByBoundary () {
            aborts = $q.defer();

            Branch
                .withHttpConfig({timeout: aborts.promise})
                .getList({boundary_name: vm.filter.q})
                .then(function (response) {
                    loadBranchList(response.plain());
                })
                .finally(function () {
                    $timeout(function () {
                        vm.dataIsLoaded = true;
                    }, 1000);
                });
        }

        function filterByProduct () {
            if (!vm.filter.selectedProduct) {
                vm.dataIsLoaded = false;
                return;
            }

            var branchIds = [];
            var selectedProduct = vm.filter.selectedProduct.toLowerCase();

            vm.list.forEach(function(branch){
                if (branch.hasOwnProperty('products')) {
                    for (var i = 0; i < branch.products.length; i++) {
                        if (branch.products[i].product.name.toLowerCase() == selectedProduct) {
                            branchIds.push(branch.id);
                            break;
                        }
                    }
                }
            });

            vm.dataIsLoaded = true;

            vm.hasProduct.count = branchService.highlightMarkers(branchIds);
            vm.hasProduct.percentage = Math.floor(vm.hasProduct.count / vm.list.length * 100);
            vm.hasProduct.fraction = vm.hasProduct.count + ' / ' + vm.list.length;

            $rootScope.$broadcast('product-saturation-numbers-update', {data: vm.hasProduct});
        }

        function newProduct(event) {
            modalServices.showNewProductForm(event)
                .then(function (product) {

                });
        }

        function getBranchesWithinDateRange(dateStart, dateEnd) {
            vm.dataIsLoaded = false;

            Branch
                .withHttpConfig({timeout: aborts.promise})
                .getList({'start_date': dateStart, 'end_date': dateEnd})
                .then(function (response) {
                    loadBranchList(response.plain());
                })
                .finally(function () {
                    $timeout(function () {
                        vm.dataIsLoaded = true;
                    }, 1000);
                });
        }

        function pickDateRange($event, showTemplate) {
            vm.selectedRange.showTemplate = showTemplate;

            $mdDateRangePicker.show({
                targetEvent: $event,
                model: vm.selectedRange
            }).then(function (result) {
                if (result) {
                    vm.selectedRange = result;

                    var momentDateStart = moment(vm.selectedRange.dateStart),
                        momentDateEnd = moment(vm.selectedRange.dateEnd);

                    var dateStartStr = momentDateStart.format('MMM D, YYYY'),
                        dateEndStr = momentDateEnd.format('MMM D, YYYY');

                    vm.selectedDate.formatted = dateStartStr + ' - ' + dateEndStr;
                    vm.selectedDate.start = momentDateStart.format('YYYY-MM-DD');
                    vm.selectedDate.end = momentDateEnd.format('YYYY-MM-DD');

                    getBranchesWithinDateRange(vm.selectedDate.start, vm.selectedDate.end);
                }
            })
        }
    }
}());