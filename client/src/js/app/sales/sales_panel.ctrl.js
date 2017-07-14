(function(){
'use strict';

angular.module('demoApp.sales')
    .controller('salesPanelController', ['$q', '$scope', '$rootScope', 'userTerritoriesService', 'gmapServices', 'branchService', '$mdSidenav', 'placesService', '$timeout', 'alertServices', 'salesTransactionService', salesPanelController]);

    function salesPanelController ($q, $scope, $rootScope, userTerritoriesService, gmapServices, branchService, $mdSidenav, placesService, $timeout, alertServices, salesTransactionService) {
        var vm = this;

        var polygonTerritory;

        var foundTypeIndex,
            isSelected;

        vm.toggleTransactions = false;

        var selectedTypes = [];

        vm.territories = [];

        vm.filter = {
            q: '',
            qt: ''
        };

        vm.toggleToolbarPanel = toggleToolbarPanel;
        vm.showTerritoryDetails = showTerritoryDetails;
        vm.toggleType = toggleType;
        vm.toggleTransactionsDisplay = toggleTransactionsDisplay;
        vm.showTransaction = showTransaction;


        initialize();

        function initialize () {
            $rootScope.$watch('currentUser', function (newValue) {
                if (!newValue) return;

                userTerritoriesService.getTerritories()
                    .then(function (territories) {
                        vm.territories = angular.copy(territories);
                    });

                salesTransactionService.getUserTransactions()
                    .then(function(transactions){
                        vm.transactions = salesTransactionService.initMarkers(transactions);
                    });
                //vm.dynamicTransactions = new DynamicItems();
            });

            var rawTypes = placesService.getPlaceTypes().map(function (type) {
                foundTypeIndex = placesService.defaultPlaceTypes.indexOf(type);
                isSelected = false;

                // initially select default place type
                if (foundTypeIndex !== -1) {
                    selectedTypes.push(type);
                    isSelected = true;
                }

                return {
                    name: type,
                    model: isSelected
                }
            });

            vm.placeTypes = _.groupBy(rawTypes, function(item, index){
               return index % 2;
            });

            $scope.$watch(function () {
                return vm.loadPois;
            }, function (newValue, oldValue) {
                if (newValue === oldValue) return;

                if (newValue) {
                    placesService.showVisiblePOIs();
                    return;
                }

                placesService.hidePOIs();
            });
        }

        function toggleToolbarPanel () {
            vm.filter.q = '';
            vm.showSalesTransactionsList = !vm.showSalesTransactionsList;
        }

        function showPolygonTerritory(latLngArray) {
            if (!latLngArray.length) {
                alertServices.showError('Cannot load polygon, data error.');
                return;
            }

            if (polygonTerritory) {
                polygonTerritory.setPath(latLngArray);
                return;
            }

            polygonTerritory = gmapServices.createPolygon(latLngArray, '#3f51b5');
            polygonTerritory.setVisible(false);
        }

        function toggleType(type) {
            var arr = vm.placeTypes['0'].concat(vm.placeTypes['1']);
            var val = _.findWhere(arr, {name: type});

            var index = selectedTypes.indexOf(val.name);

            if (val.model && index === -1) {
                selectedTypes.push(val.name)
            } else if (index !== -1) {
                selectedTypes.splice(index, 1);
            }
        }

        function toggleTransactionsDisplay (flag) {
            if (flag) {
                // show transaction markers
                salesTransactionService.showMarkers();
            } else {
                // hide
                salesTransactionService.hideMarkers();
                gmapServices.hideDirectionsRenderer();
            }
        }

        function showTerritoryDetails (item) {
            $rootScope.$broadcast('clear-compare-branches');

            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').show();

            $rootScope.selectedTerritory = item;

            branchService.hideMarkers();
            placesService.hidePOIs();

            showPolygonTerritory(item.territory.geom);

            gmapServices.setZoomIfGreater(12);
            gmapServices.panToPolygon(polygonTerritory);

            var promises = [];

            // load places
            if (vm.loadPois) {
                console.log('selected place types: ', selectedTypes);
                promises.push(
                    placesService.loadPOIs(item.territoryid, selectedTypes)
                        .then(function (response) {
                            placesService.showPOIs(response);
                            $rootScope.selectedTerritory.places = response;
                        })
                );
            }

            promises.push(
                userTerritoriesService.getTerritoryBranches(item.territoryid)
                    .then(function (response) {
                        $rootScope.selectedTerritory.branches = response;

                        if (!response.length) {
                            alertServices.showBottomLeftToast('This territory doesnt have branch yet.');
                        } else {
                            branchService.loadMarkers(response);
                        }

                        $timeout(function () {
                            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').hide();
                        }, 500);

                        $mdSidenav('territoryInfoPanelSidenav').open();
                        $rootScope.$broadcast('territory_selected', $rootScope.selectedTerritory);
                    })
            );

            //$q.all([promises])
            //    .finally(function(){
            //        $timeout(function () {
            //            $('md-list-item#territory-' + item.territoryid + ' .md-list-item-text md-progress-circular').hide();
            //        }, 1000);
            //    });
        }

        function showTransaction (item) {
            console.log('showTransaction: ',item);
            salesTransactionService.showTransactionOnMap(item);
        }


        /* DYNAMIC ITEMS */

        // In this example, we set up our model using a class.
        // Using a plain object works too. All that matters
        // is that we implement getItemAtIndex and getLength.
        //var DynamicItems = function () {
        //    /**
        //     * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
        //     */
        //    this.loadedPages = {};
        //
        //    /** @type {number} Total number of items. */
        //    this.numItems = 0;
        //
        //    /** @const {number} Number of items to fetch per request. */
        //    this.PAGE_SIZE = 50;
        //
        //    this.fetchNumItems_();
        //};
        //
        //// Required.
        //DynamicItems.prototype.getItemAtIndex = function (index) {
        //    console.log('DynamicItems getItemAtIndex',index);
        //    var pageNumber = Math.floor(index / this.PAGE_SIZE);
        //    var page = this.loadedPages[pageNumber];
        //
        //    if (page) {
        //        var item = page[index % this.PAGE_SIZE];
        //        console.log('page: ',page);
        //        return item;
        //    } else if (page !== null) {
        //        this.fetchPage_(pageNumber);
        //    }
        //};
        //
        //// Required.
        //DynamicItems.prototype.getLength = function () {
        //    return this.numItems;
        //};
        //
        //DynamicItems.prototype.fetchPage_ = function (pageNumber) {
        //    console.log('DynamicItems fetchPage_',pageNumber);
        //    // Set the page to null so we know it is already being fetched.
        //    this.loadedPages[pageNumber] = null;
        //
        //    var that = this;
        //    // For demo purposes, we simulate loading more items with a timed
        //    // promise. In real code, this function would likely contain an
        //    // $http request.
        //    salesTransactionService.getUserTransactions(pageNumber, this.PAGE_SIZE)
        //        .then(angular.bind(this, function(transactions){
        //
        //            that.loadedPages[pageNumber] = [];
        //
        //            transactions.forEach(function(item){
        //                that.loadedPages[pageNumber].push(item);
        //            });
        //        }));
        //};
        //
        //DynamicItems.prototype.fetchNumItems_ = function () {
        //    // For demo purposes, we simulate loading the item count with a timed
        //    // promise. In real code, this function would likely contain an
        //    // $http request.
        //    $timeout(angular.noop, 300).then(angular.bind(this, function () {
        //        this.numItems = 2000;
        //    }));
        //};














    }
}());