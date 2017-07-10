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

            //$rootScope.$watch('showBranchCompareTable')

            $rootScope.$on('new-compare-branch', function (e, branch) {

                if (_.findWhere(vm.branchCompareList, {id: branch.id})) return;

                vm.branchCompareList.push(transform(branch));

                compileList();

                highlightComparedBranches();

                console.log('list: ', vm.list);
            });

            $rootScope.$watch('showBranchCompareTable', function (newValue, oldValue) {
                if (newValue === oldValue) return;

                if (newValue) highlightComparedBranches();
                else branchService.resetMarkersColor();
            });


            //$('table#compare-branch-table td').hover(function () {
            //    $('table#compare-branch-table td:nth-child(' + ($(this).index() + 1) + ')').addClass('hightlightColumn');
            //}, function () {
            //    $('table#compare-branch-table td:nth-child(' + ($(this).index() + 1) + ')').removeClass('hightlightColumn');
            //});
            //
            //$('table#compare-branch-table td').hover(function () {
            //    $('table#compare-branch-table td:nth-child(' + ($(this).index() + 1) + ')').addClass('hover');
            //    $('table#compare-branch-table th:nth-child(' + ($(this).index() + 1) + ')').addClass('hover');
            //}, function () {
            //    $('table#compare-branch-table td:nth-child(' + ($(this).index() + 1) + ')').removeClass('hover');
            //    $('table#compare-branch-table th').removeClass('hover');
            //});

            //$rootScope.$on('branch-infowindow-closed', function(e, obj) {
            //    console.log('branch-infowindow-closed ',obj);
            //    removeBranch({id: obj.id});
            //});
        }

        function highlightComparedBranches () {
            var ids = _.pluck(vm.branchCompareList, 'id');

            branchService.highlightMarkers(ids);
            //console.log('highlight these ids: ', ids);
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
                branchService.unHighlistMarker(branchId);

                vm.branchCompareList.splice(index, 1);

                compileList();

                if($scope.$$phase) return;

                $scope.$apply(function(){
                    return vm.list;
                });
                //branchService.closeInfoWindowById(branch.id);
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