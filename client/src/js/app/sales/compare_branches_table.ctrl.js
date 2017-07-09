(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('compareBranchesTableController', ['$rootScope', '$scope', compareBranchesTableController]);

    function compareBranchesTableController ($rootScope, $scope) {
        var vm = this;

        vm.branchCompareList = [];
        $rootScope.showBranchCompareTable = false;
        vm.currentIndex = 0;

        vm.removeBranch = removeBranch;
        vm.close = close;

        initialize();

        function initialize() {

            $scope.$watchCollection(function () {
                return vm.branchCompareList;
            }, function (newCollection) {
                if (newCollection.length) {
                    $rootScope.showBranchCompareTable = true;
                    $('#show-compare-branches-btn').show();
                    return;
                }

                $rootScope.showBranchCompareTable = false;
                $('#show-compare-branches-btn').hide();
            });

            $rootScope.$on('new-compare-branch', function (e, branch) {

                if (_.findWhere(vm.branchCompareList, {id: branch.id})) return;

                vm.branchCompareList.push(transform(branch));

                compileList();

                console.log('list: ', vm.list);
            });

            //$rootScope.$on('branch-infowindow-closed', function(e, obj) {
            //    console.log('branch-infowindow-closed ',obj);
            //    removeBranch({id: obj.id});
            //});
        }

        function transform (obj) {
            var result = {};

            result['id'] = obj.id;
            result['name'] = obj.name;

            obj.products.forEach(function(prod){
               result[prod.product.name] = prod.product.name;
            });

            return result;
        }

        function indexByAttribute(collection) {
            return collection.reduce(function (result, item) {

                angular.forEach(item, function (value, index) {
                    result[index] = result[index] || [];
                    result[index].push(value);
                });

                return result;
            }, {});
        }

        function compileList () {
            vm.list = indexByAttribute(vm.branchCompareList);
        }

        function removeBranch(branchId) {
            console.log('removeBranch: ',branchId);
            var index = _.findIndex(vm.branchCompareList, {id: branchId});
            console.log('removeBranch: ',index);
            if (index > -1) {
                vm.branchCompareList.splice(index, 1);
                compileList();

                if($scope.$$phase) return;

                $scope.$apply(function(){
                    return vm.list;
                });
                //branchService.closeInfoWindowById(branch.id);
            }
        }

        function close () {
            $rootScope.showBranchCompareTable = false;
        }

    }
}());