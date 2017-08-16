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
                //console.log('branchCompareList: ', newCollection);

                if (newCollection.length) {
                    $rootScope.showBranchCompareTable = true;
                    $('#show-compare-branches-btn').show();

                    if (vm.filter.semester) semesterChanged(vm.filter.semester);

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

                vm.branchCompareList = _.sortBy(vm.branchCompareList, function(item){
                    var products = getProductsByItem(item);
                    return products.length;
                }).reverse();

                //console.log('new-compare-branch branchCompareList= ',vm.branchCompareList);

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
            result['name'] = {name: obj.name, isbranch: true};

            obj.products.forEach(function(prod){
               result[prod.product.name] = {
                   name: prod.product.name
               };
            });

            return result;
        }

        function getProductsByItem (item) {
            var products = [];
            for (var key in item) if (key != 'id' || key != 'name') products.push(key);
            return products;
        }

        function getProductsInCollection (collection) {
            var products = [];
            collection.forEach(function(item){
                for (var key in item) if (key != 'id' || key != 'name') products.push(key);
            });
            return products;
        }

        function indexByAttribute(collection) {
            //console.log('collection: ',collection);

            var products = getProductsInCollection(collection);

            var result = {},
                resObj = {};

            for (var i = 0; i < collection.length; i++) {
                for (var key in collection[i]) {
                    resObj = {};

                    var item = collection[i].hasOwnProperty(key) ? collection[i][key] : {name: null};

                    if (!result.hasOwnProperty(key)) result[key] = [];

                    if (key === 'id' || key === 'name') {
                        resObj = item.hasOwnProperty('name')
                            ? {'value': item.name}
                            : {'value': item};
                        result[key].push(resObj);
                    } else {
                        if (products.indexOf(key) > -1) {
                            resObj = item.hasOwnProperty('name')
                                ? {'value': item.name}
                                : {'value': item};

                            if (item.hasOwnProperty('sellout')) resObj['sellout'] = item.sellout;
                        } else {
                            resObj = {'value': null};
                        }
                        result[key].push(resObj);
                    }
                }
            }

            //console.log('result: ',result);
            return result;
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

                    //var foundIndex = _.find(selloutData, function (sellout) {
                    //    return sellout.branchid == branch.id
                    //        && key.toLowerCase() == sellout.product.name.toLowerCase();
                    //});
                    //if (foundIndex > -1) vm.branchCompareList[index][key]['sellout'] = selloutData[foundIndex].grossup_amount;

                }
            });

            console.log('after assigning sellout: ',vm.branchCompareList);

            compileList();
        }

        function resetSellouts () {
            vm.branchCompareList.forEach(function (branch) {
                for (var key in branch) {
                    if (key == 'id' || key == 'name') continue;
                    if (branch[key].hasOwnProperty('sellout')) delete branch[key]['sellout'];
                }
            });
            //console.log('after assigning sellout: ', vm.branchCompareList);
            compileList();
        }

        function semesterChanged (semester) {
            console.log('semesterChanged: ',semester);

            resetSellouts();

            var branchIdsArray = _.pluck(vm.branchCompareList, 'id');

            branchService.getSellouts(semester, branchIdsArray)
                .then(function(sellouts){
                    console.log('sellouts: ', sellouts);
                    assignSellout(sellouts);
                });

        }

    }
}());