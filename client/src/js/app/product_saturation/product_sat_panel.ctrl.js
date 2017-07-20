(function(){
'use strict';

angular.module('demoApp.productSaturation')
    .controller('productSatPanelController', ['modalServices', '$scope', 'alertServices', 'Branch', 'branchService', '$q', '$timeout', productSatPanelController]);

    function productSatPanelController (modalServices, $scope, alertServices, Branch, branchService, $q, $timeout) {
        var vm = this;

        var aborts;

        vm.filter = {
            q: '',
            selectedType: 'name'
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
        vm.filterByProduct = filterByProduct;

        initialize();

        function initialize () {
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
                },
                {
                    name: 'product',
                    action: 'vm.filterByProduct()'
                }
            ];

            filterChanged(true);
        }

        function showBranch (branchId) {
            branchService.triggerClickBranch(branchId);
        }

        function filterChanged (isInitialLoad) {
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

            switch (vm.filter.selectedType) {
                case 'product':
                    console.log('product');
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
            vm.filter.q = '';
            vm.list = [];
            branchService.hideMarkers();
        }

        function loadBranchList (list) {
            vm.list = angular.copy(list);
            branchService.loadMarkers(vm.list, true);
        }

        function filterByName() {
            console.log('filterByName is called!');

            aborts = $q.defer();

            Branch
                .withHttpConfig({timeout: aborts.promise})
                .getList({name: vm.filter.q})
                .then(function(response){
                    console.log('response: ',response);
                    loadBranchList(response.plain());
                })
                .finally(function(){
                    $timeout(function(){
                        vm.dataIsLoaded = true;
                    }, 1000);
                });

        }

        function filterByTerritory () {
            console.log('filterByTerritory is called');

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
            console.log('filterByBoundary is called');

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
            console.log('filterByProduct is called');
        }

        function newProduct(event) {
            modalServices.showNewProductForm(event)
                .then(function (product) {

                });
        }
    }
}());