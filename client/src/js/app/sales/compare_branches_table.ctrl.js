(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('compareBranchesTableController', ['$rootScope', '$scope', 'branchService', compareBranchesTableController]);

    function compareBranchesTableController ($rootScope, $scope, branchService) {
        var vm = this;

        vm.branchCompareList = [];
        $rootScope.showBranchCompareTable = false;
        vm.currentIndex = 0;

        vm.removeBranch = removeBranch;
        vm.hoverIn = hoverIn;
        vm.hoverOut = hoverOut;
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
                branchService.resetMarkersColor();
            });

            $rootScope.$on('new-compare-branch', function (e, branch) {

                if (_.findWhere(vm.branchCompareList, {id: branch.id})) return;

                vm.branchCompareList.push(transform(branch));

                compileList();
                highlightComparedBranches();
            });

            $rootScope.$watch('showBranchCompareTable', function (newValue, oldValue) {
                if (newValue === oldValue) return;

                if (newValue) highlightComparedBranches();
                else branchService.resetMarkersColor();
            });

            $(document).on('mouseover', '#compare-branch-table-container table.md-table tr:nth-child(2) td', function () {
                var index = $(this).index();
                $("#compare-branch-table-container table.md-table tr").find("td:nth-child(" + (index + 1) + ")").addClass("current-col");
            });

            $(document).on('mouseout', '#compare-branch-table-container table.md-table tr:nth-child(2) td', function () {
                var index = $(this).index();
                $("#compare-branch-table-container table.md-table tr").find("td:nth-child(" + (index + 1) + ")").removeClass("current-col");
            });
        }

        function highlightComparedBranches () {
            var ids = _.pluck(vm.branchCompareList, 'id');
            branchService.highlightMarkers(ids);
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
            var index = _.findIndex(vm.branchCompareList, {id: branchId});

            if (index > -1) {
                branchService.unHighlightMarker(branchId);

                vm.branchCompareList.splice(index, 1);

                compileList();

                if($scope.$$phase) return;

                $scope.$apply(function(){
                    return vm.list;
                });
            }
        }

        function hoverIn (branchId) {
            branchService.animateMarker(branchId);
        }

        function hoverOut (branchId) {
            branchService.clearAnimationMarker(branchId);
        }

        function close () {
            $rootScope.showBranchCompareTable = false;
        }



    }
}());