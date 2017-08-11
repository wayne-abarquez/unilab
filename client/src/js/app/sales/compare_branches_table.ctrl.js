(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('compareBranchesTableController', ['$rootScope', '$scope', 'SEMESTERS', 'branchService', compareBranchesTableController]);

    function compareBranchesTableController ($rootScope, $scope, SEMESTERS, branchService) {
        var vm = this;

        vm.branchCompareList = [];
        $rootScope.showBranchCompareTable = false;
        vm.currentIndex = 0;

        vm.semesters = SEMESTERS;

        vm.filter = {
            semester: null
        };

        vm.removeBranch = removeBranch;
        vm.hoverIn = hoverIn;
        vm.hoverOut = hoverOut;
        vm.close = close;
        vm.semesterChanged = semesterChanged;

        initialize();

        function initialize() {

            $rootScope.$on('clear-compare-branches', function (e) {
                clearCompareBranch();
            });

            $scope.$watchCollection(function () {
                return vm.branchCompareList;
            }, function (newCollection) {
                console.log('branchCompareList: ', newCollection);

                if (newCollection.length) {
                    $rootScope.showBranchCompareTable = true;
                    $('#show-compare-branches-btn').show();

                    if (vm.filter.semester) semesterChanged(vm.filter.semester.value);

                    return;
                }

                $rootScope.showBranchCompareTable = false;
                $('#show-compare-branches-btn').hide();
                branchService.resetMarkersColor();
            });

            $rootScope.$on('new-compare-branch', function (e, branch) {
                if (_.findWhere(vm.branchCompareList, {id: branch.id})) return;

                if (vm.branchCompareList.length == 0) branchService.unHighlightMarkers();

                vm.branchCompareList.push(transform(branch));

                compileList();
                highlightComparedBranches();
            });

            $rootScope.$watch('showBranchCompareTable', function (newValue, oldValue) {
                if (newValue === oldValue) return;

                if (newValue) {
                    branchService.unHighlightMarkers();
                    highlightComparedBranches();
                }
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
            result['name'] = {name: obj.name};

            obj.products.forEach(function(prod){
               result[prod.product.name] = {
                   name: prod.product.name
               };
            });

            return result;
        }

        function indexByAttribute(collection) {
            console.log('indexByAttribute: collection=',collection);

            var obj;

            return collection.reduce(function (result, item) {

                angular.forEach(item, function (product, index) {
                    result[index] = result[index] || [];

                    obj = product.hasOwnProperty('name')
                            ? {'value': product.name}
                            : {'value': product};

                    if (product.hasOwnProperty('sellout')) obj['sellout'] = product.sellout;

                    result[index].push(obj)
                });

                return result;
            }, {});
        }

        function compileList () {
            vm.list = indexByAttribute(vm.branchCompareList);
            console.log('compile vm.list: ',vm.list);
        }

        function removeBranch(branchId) {
            var index = _.findIndex(vm.branchCompareList, {id: branchId});

            if (index > -1) {
                branchService.unHighlightMarker(branchId);

                vm.branchCompareList.splice(index, 1);

                compileList();

                if($scope.$$phase) return;
            }
        }

        function clearCompareBranch () {
            vm.branchCompareList = [];

            if ($scope.$$phase) return;

            $scope.$apply(function () {
                vm.list = [];
            });

            close();
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

        function assignSellout(selloutData) {
            console.log('assign sellout : ',selloutData);

            var foundSellout;

            vm.branchCompareList.forEach(function(branch, index){
                for (var key in branch) {
                    if (key == 'id' || key == 'name') continue;

                    foundSellout = _.find(selloutData, function(sellout){
                        return  sellout.branchid === branch.id
                            && key.toLowerCase() === sellout.product.name.toLowerCase();
                    });

                    if (foundSellout) branch[key]['sellout'] = foundSellout.grossup_amount;
                }
            });

            console.log('after assigning sellout: ',vm.branchCompareList);

            compileList();
        }

        function semesterChanged (semester) {
            var branchIdsArray = _.pluck(vm.branchCompareList, 'id');

            branchService.getSellouts(semester, branchIdsArray)
                .then(function(sellouts){
                    console.log('sellouts: ', sellouts);
                    assignSellout(sellouts);
                });

        }

    }
}());