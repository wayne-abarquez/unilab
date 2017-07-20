(function () {
    'use strict';

    angular.module('demoApp')
        .factory('modalServices', ['$q', '$mdDialog', '$mdMedia', '$rootScope', modalServices]);

    function modalServices($q, $mdDialog, $mdMedia, $rootScope) {
        var service = {};

        var customFullscreen = $mdMedia('xs') || $mdMedia('sm');

        var newTransactionModal,
            mapPlotOptionsModal,
            fraudTableModal,
            newProductModal,
            addProductToBranchModal;

        /* Service Functions */
        service.showNewBranchForm = showNewBranchForm;
        service.showNewTransactionForm = showNewTransactionForm;
        service.showMapPlotOptions = showMapPlotOptions;
        service.showFraudResult = showFraudResult;
        service.showNewProductForm  = showNewProductForm;
        service.showAddProductToBranch = showAddProductToBranch;
        service.hideResolveModal = hideResolveModal;
        service.closeModal = closeModal;

        function showModal(modalObj, modalParams) {
            var dfd = $q.defer();
            if (modalObj) {
                dfd.reject("Modal already opened");
            } else {
                $rootScope.$broadcast("modal-opened");
                modalObj = $mdDialog.show(modalParams);
                modalObj.then(function (result) {
                        dfd.resolve(result);
                    }, function (reason) {
                        $rootScope.$broadcast("modal-dismissed");
                        dfd.reject(reason);
                    })
                    .finally(function () {
                        modalObj = null;
                    });
            }
            return dfd.promise;
        }

        function showNewBranchForm(ev, params) {
            var opts = {
                controller: 'newBranchController',
                controllerAs: 'vm',
                templateUrl: '/partials/modals/_new_branch.html',
                parent: angular.element(document.querySelector('#index-container')),
                locals: {param: params},
                targetEvent: ev,
                hasBackdrop: false,
                fullscreen: customFullscreen,
                onComplete: function (scope, element, options) {
                    $('.md-scroll-mask').css('z-index', '-1');
                }
            };

            return showModal(newTransactionModal, opts);
        }

        function showNewTransactionForm(ev, params) {
            var opts = {
                controller: 'newTransactionController',
                controllerAs: 'vm',
                templateUrl: '/partials/modals/_new_transaction.html',
                parent: angular.element(document.querySelector('#index-container')),
                locals: {param: params},
                targetEvent: ev,
                hasBackdrop: false,
                fullscreen: customFullscreen,
                onComplete: function (scope, element, options) {
                    $('.md-scroll-mask').css('z-index', '-1');
                }
            };

            return showModal(newTransactionModal, opts);
        }

        function showMapPlotOptions () {
            var opts = {
                controller: 'mapPlotOptionsController',
                controllerAs: 'vm',
                templateUrl: '/partials/modals/_map_plot_options.html',
                parent: angular.element(document.querySelector('body')),
                fullscreen: customFullscreen,
                onComplete: function (scope, element, options) {
                    $('.md-scroll-mask').css('z-index', '-1');
                }
            };

            return showModal(mapPlotOptionsModal, opts);
        }

        function showFraudResult (ev, data) {
            var opts = {
                controller: 'fraudReportTableController',
                controllerAs: 'vm',
                templateUrl: '/partials/modals/_fraud_report_table.html',
                parent: angular.element(document.querySelector('#fraud-container')),
                locals: {data: data},
                targetEvent: ev,
                fullscreen: $mdMedia('lg')
                //onComplete: function (scope, element, options) {
                //    $('.md-scroll-mask').css('z-index', '-1');
                //}
            };

            return showModal(fraudTableModal, opts);
        }

        function showNewProductForm(ev) {
            var opts = {
                controller: 'newProductController',
                controllerAs: 'vm',
                templateUrl: '/partials/modals/_new_product.html',
                parent: angular.element(document.querySelector('#product-saturation-container')),
                targetEvent: ev,
                hasBackdrop: true,
                fullscreen: customFullscreen
            };

            return showModal(newProductModal, opts);
        }

        function showAddProductToBranch (branch) {
            var opts = {
                controller: 'addProductToBranchController',
                controllerAs: 'vm',
                templateUrl: '/partials/modals/_add_product_to_branch.html',
                parent: angular.element(document.querySelector('#product-saturation-container')),
                locals: {branch: branch},
                hasBackdrop: true,
                fullscreen: customFullscreen
            };

            return showModal(addProductToBranchModal, opts);
        }

        function hideResolveModal(response) {
            $rootScope.$broadcast("modal-closed");
            $mdDialog.hide(response);
        }

        // Close Modal
        function closeModal() {
            $rootScope.$broadcast("modal-closed");
            $mdDialog.cancel();
        }

        return service;
    }
}());